import * as XLSX from 'xlsx'
import { listProducts, createProduct } from '@/features/products/services/product.service'
import { listSuppliers, createSupplier } from '@/features/suppliers/services/supplier.service'
import {
  PRODUCT_UNIT_LIST,
  PRODUCT_UNITS,
  type ProductUnit,
} from '@/shared/constants/status'
import { AppError } from '@/shared/lib/errors'
import type { ProductFormValues } from '@/features/products/schemas/product.schema'
import type { SupplierFormValues } from '@/features/suppliers/schemas/supplier.schema'

const PRODUCT_SHEET = 'Products'
const SUPPLIER_SHEET = 'Suppliers'

function downloadWorkbook(workbook: XLSX.WorkBook, fileName: string): void {
  XLSX.writeFile(workbook, fileName)
}

export async function exportProductsExcel(): Promise<void> {
  try {
    const products = await listProducts()
    const rows = products.map((product) => ({
      name_zh: product.name_zh,
      name_en: product.name_en,
      sku: product.sku ?? '',
      unit: product.unit,
      min_stock: product.min_stock,
      category_id: product.category_id ?? '',
      is_active: product.is_active ? 1 : 0,
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, PRODUCT_SHEET)
    downloadWorkbook(workbook, `products-${new Date().toISOString().slice(0, 10)}.xlsx`)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to export products', 'EXCEL_EXPORT_FAILED')
  }
}

export async function exportSuppliersExcel(): Promise<void> {
  try {
    const suppliers = await listSuppliers()
    const rows = suppliers.map((supplier) => ({
      name: supplier.name,
      contact_name: supplier.contact_name ?? '',
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      wechat: supplier.wechat ?? '',
      notes: supplier.notes ?? '',
      is_active: supplier.is_active ? 1 : 0,
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, SUPPLIER_SHEET)
    downloadWorkbook(workbook, `suppliers-${new Date().toISOString().slice(0, 10)}.xlsx`)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to export suppliers', 'EXCEL_EXPORT_FAILED')
  }
}

function readSheetRows(file: ArrayBuffer, sheetName: string): Record<string, unknown>[] {
  const workbook = XLSX.read(file, { type: 'array' })
  const sheet = workbook.Sheets[sheetName] ?? workbook.Sheets[workbook.SheetNames[0] ?? '']
  if (!sheet) {
    throw new AppError('Excel sheet not found', 'EXCEL_SHEET_MISSING')
  }
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)
}

function asString(value: unknown): string {
  if (value == null) {
    return ''
  }
  return String(value).trim()
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function asUnit(value: unknown): ProductUnit {
  const unit = asString(value)
  if (PRODUCT_UNIT_LIST.includes(unit as ProductUnit)) {
    return unit as ProductUnit
  }
  return PRODUCT_UNITS.KG
}

export async function importProductsExcel(file: File): Promise<number> {
  try {
    const buffer = await file.arrayBuffer()
    const rows = readSheetRows(buffer, PRODUCT_SHEET)
    let imported = 0

    for (const row of rows) {
      const nameZh = asString(row.name_zh)
      const nameEn = asString(row.name_en)
      if (!nameZh || !nameEn) {
        continue
      }

      const categoryId = asString(row.category_id)
      const sku = asString(row.sku)
      const values: ProductFormValues = {
        name_zh: nameZh,
        name_en: nameEn,
        unit: asUnit(row.unit),
        min_stock: asNumber(row.min_stock, 0),
        is_active: asNumber(row.is_active, 1) !== 0,
      }

      if (sku) {
        values.sku = sku
      }
      if (categoryId) {
        values.category_id = categoryId
      }

      await createProduct(values)
      imported += 1
    }

    return imported
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to import products', 'EXCEL_IMPORT_FAILED')
  }
}

export async function importSuppliersExcel(file: File): Promise<number> {
  try {
    const buffer = await file.arrayBuffer()
    const rows = readSheetRows(buffer, SUPPLIER_SHEET)
    let imported = 0

    for (const row of rows) {
      const name = asString(row.name)
      if (!name) {
        continue
      }

      const values: SupplierFormValues = {
        name,
        is_active: asNumber(row.is_active, 1) !== 0,
      }

      const contactName = asString(row.contact_name)
      const phone = asString(row.phone)
      const email = asString(row.email)
      const wechat = asString(row.wechat)
      const notes = asString(row.notes)

      if (contactName) values.contact_name = contactName
      if (phone) values.phone = phone
      if (email) values.email = email
      if (wechat) values.wechat = wechat
      if (notes) values.notes = notes

      await createSupplier(values)
      imported += 1
    }

    return imported
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Failed to import suppliers', 'EXCEL_IMPORT_FAILED')
  }
}
