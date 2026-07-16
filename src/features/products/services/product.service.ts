import { supabase } from '@/lib/supabase/client'
import { AppError } from '@/shared/lib/errors'
import type {
  Category,
  ProductSupplier,
  ProductWithCategory,
} from '@/shared/types/database'
import type { ProductFormValues } from '@/features/products/schemas/product.schema'

type ProductPayload = {
  name_zh: string
  name_en: string
  sku: string | null
  category_id: string | null
  unit: ProductFormValues['unit']
  min_stock: number
  is_active: boolean
  image_url: string | null
}

export type ProductSupplierUpsertInput = Pick<
  ProductSupplier,
  'product_id' | 'supplier_id'
> &
  Partial<
    Pick<
      ProductSupplier,
      'unit_price' | 'package_size' | 'is_preferred' | 'lead_days'
    >
  >

const PRODUCT_SELECT = '*, categories(id,name_zh,name_en)'

function normalizeOptionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function normalizeProductPayload(values: ProductFormValues): ProductPayload {
  return {
    name_zh: values.name_zh.trim(),
    name_en: values.name_en.trim(),
    sku: normalizeOptionalText(values.sku),
    category_id: normalizeOptionalText(values.category_id),
    unit: values.unit,
    min_stock: values.min_stock,
    is_active: values.is_active,
    image_url: normalizeOptionalText(values.image_url),
  }
}

function searchPattern(search: string): string {
  return `%${search.trim().replace(/[,%]/g, '')}%`
}

export async function listProductCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name_zh', { ascending: true })

  if (error) {
    throw new AppError(error.message, 'CATEGORIES_LIST_FAILED')
  }

  return (data ?? []) as Category[]
}

export async function listProducts(
  search?: string,
): Promise<ProductWithCategory[]> {
  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .order('name_zh', { ascending: true })

  const trimmedSearch = search?.trim()
  if (trimmedSearch) {
    const pattern = searchPattern(trimmedSearch)
    query = query.or(
      `name_zh.ilike.${pattern},name_en.ilike.${pattern},sku.ilike.${pattern}`,
    )
  }

  const { data, error } = await query

  if (error) {
    throw new AppError(error.message, 'PRODUCTS_LIST_FAILED')
  }

  return (data ?? []) as ProductWithCategory[]
}

export async function createProduct(
  values: ProductFormValues,
): Promise<ProductWithCategory> {
  const { data, error } = await supabase
    .from('products')
    .insert(normalizeProductPayload(values))
    .select(PRODUCT_SELECT)
    .single()

  if (error || !data) {
    throw new AppError(error?.message ?? 'Product not created', 'PRODUCT_CREATE_FAILED')
  }

  return data as ProductWithCategory
}

export async function updateProduct(
  id: string,
  values: ProductFormValues,
): Promise<ProductWithCategory> {
  const { data, error } = await supabase
    .from('products')
    .update(normalizeProductPayload(values))
    .eq('id', id)
    .select(PRODUCT_SELECT)
    .single()

  if (error || !data) {
    throw new AppError(error?.message ?? 'Product not updated', 'PRODUCT_UPDATE_FAILED')
  }

  return data as ProductWithCategory
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    throw new AppError(error.message, 'PRODUCT_DELETE_FAILED')
  }
}

export async function listProductSuppliers(
  productId: string,
): Promise<ProductSupplier[]> {
  const { data, error } = await supabase
    .from('product_suppliers')
    .select('*')
    .eq('product_id', productId)
    .order('is_preferred', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    throw new AppError(error.message, 'PRODUCT_SUPPLIERS_LIST_FAILED')
  }

  return (data ?? []) as ProductSupplier[]
}

export async function upsertProductSupplier(
  values: ProductSupplierUpsertInput,
): Promise<ProductSupplier> {
  const { data, error } = await supabase
    .from('product_suppliers')
    .upsert(values, { onConflict: 'product_id,supplier_id' })
    .select('*')
    .single()

  if (error || !data) {
    throw new AppError(
      error?.message ?? 'Product supplier not saved',
      'PRODUCT_SUPPLIER_UPSERT_FAILED',
    )
  }

  return data as ProductSupplier
}
