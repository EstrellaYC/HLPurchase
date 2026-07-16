import { supabase } from '@/lib/supabase/client'
import { PROCUREMENT_NEED_STATUS, PURCHASE_ORDER_STATUS } from '@/shared/constants/status'
import { AppError } from '@/shared/lib/errors'
import { todayISODate } from '@/shared/utils/format'
import type {
  ProcurementNeed,
  ProcurementNeedWithItems,
  Product,
  ProductSupplier,
  PurchaseOrderWithDetails,
} from '@/shared/types/database'

export type ProcurementNeedItemInput = {
  product_id: string
  quantity: number
  note?: string | null
}

export type CreateNeedInput = {
  title: string
  needed_date?: string | null
  note?: string | null
  created_by: string
  items: ProcurementNeedItemInput[]
}

export type NeedProductOption = Pick<Product, 'id' | 'name_zh' | 'name_en' | 'unit'>

type ProductSupplierChoice = Pick<
  ProductSupplier,
  'product_id' | 'supplier_id' | 'unit_price' | 'is_preferred' | 'package_size'
>

type GroupedNeedItem = {
  item: ProcurementNeedWithItems['procurement_need_items'][number]
  supplier: ProductSupplierChoice
}

function toProcurementNeedServiceError(
  error: unknown,
  fallback: string,
  code: string,
): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error && error.message) {
    return new AppError(error.message, code)
  }

  return new AppError(fallback, code)
}

function normalizeNote(note: string | null | undefined): string | null {
  return note?.trim() ? note.trim() : null
}

function selectSupplierForProduct(
  item: ProcurementNeedWithItems['procurement_need_items'][number],
  suppliers: ProductSupplierChoice[],
): ProductSupplierChoice {
  const productSuppliers = suppliers.filter(
    (supplier) => supplier.product_id === item.product_id,
  )

  if (productSuppliers.length === 0) {
    throw new AppError(
      `No supplier configured for ${item.products.name_zh}`,
      'PRODUCT_SUPPLIER_NOT_FOUND',
    )
  }

  const fallbackSupplier = productSuppliers[0]
  if (!fallbackSupplier) {
    throw new AppError(
      `No supplier configured for ${item.products.name_zh}`,
      'PRODUCT_SUPPLIER_NOT_FOUND',
    )
  }

  return productSuppliers.find((supplier) => supplier.is_preferred) ?? fallbackSupplier
}

async function fetchOrdersByIds(ids: string[]): Promise<PurchaseOrderWithDetails[]> {
  if (ids.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('purchase_orders')
    .select(
      `
      *,
      suppliers (
        id,
        name,
        phone,
        contact_name
      ),
      purchase_order_items (
        *,
        products (
          id,
          name_zh,
          name_en,
          unit
        )
      )
    `,
    )
    .in('id', ids)
    .order('created_at', { ascending: false })

  if (error) {
    throw new AppError(error.message, 'PURCHASE_ORDERS_LIST_FAILED')
  }

  return (data ?? []) as PurchaseOrderWithDetails[]
}

export async function listNeedProducts(): Promise<NeedProductOption[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name_zh, name_en, unit')
      .eq('is_active', true)
      .order('name_zh', { ascending: true })

    if (error) {
      throw new AppError(error.message, 'PRODUCTS_LIST_FAILED')
    }

    return (data ?? []) as NeedProductOption[]
  } catch (error) {
    throw toProcurementNeedServiceError(
      error,
      'Failed to load products',
      'PRODUCTS_LIST_FAILED',
    )
  }
}

export async function listNeeds(): Promise<ProcurementNeedWithItems[]> {
  try {
    const { data, error } = await supabase
      .from('procurement_needs')
      .select(
        `
        *,
        procurement_need_items (
          *,
          products (
            id,
            name_zh,
            name_en,
            unit
          )
        )
      `,
      )
      .order('created_at', { ascending: false })

    if (error) {
      throw new AppError(error.message, 'PROCUREMENT_NEEDS_LIST_FAILED')
    }

    return (data ?? []) as ProcurementNeedWithItems[]
  } catch (error) {
    throw toProcurementNeedServiceError(
      error,
      'Failed to load procurement needs',
      'PROCUREMENT_NEEDS_LIST_FAILED',
    )
  }
}

export async function getNeed(id: string): Promise<ProcurementNeedWithItems> {
  try {
    const { data, error } = await supabase
      .from('procurement_needs')
      .select(
        `
        *,
        procurement_need_items (
          *,
          products (
            id,
            name_zh,
            name_en,
            unit
          )
        )
      `,
      )
      .eq('id', id)
      .single()

    if (error || !data) {
      throw new AppError(error?.message ?? 'Need not found', 'PROCUREMENT_NEED_NOT_FOUND')
    }

    return data as ProcurementNeedWithItems
  } catch (error) {
    throw toProcurementNeedServiceError(
      error,
      'Failed to load procurement need',
      'PROCUREMENT_NEED_NOT_FOUND',
    )
  }
}

export async function createNeed(input: CreateNeedInput): Promise<ProcurementNeedWithItems> {
  try {
    if (input.items.length === 0) {
      throw new AppError('At least one item is required', 'PROCUREMENT_NEED_EMPTY_ITEMS')
    }

    const { data: need, error: needError } = await supabase
      .from('procurement_needs')
      .insert({
        title: input.title.trim(),
        needed_date: input.needed_date || null,
        note: normalizeNote(input.note),
        created_by: input.created_by,
      })
      .select('*')
      .single()

    if (needError || !need) {
      throw new AppError(
        needError?.message ?? 'Need not created',
        'PROCUREMENT_NEED_CREATE_FAILED',
      )
    }

    const createdNeed = need as ProcurementNeed
    const { error: itemsError } = await supabase.from('procurement_need_items').insert(
      input.items.map((item) => ({
        need_id: createdNeed.id,
        product_id: item.product_id,
        quantity: item.quantity,
        note: normalizeNote(item.note),
      })),
    )

    if (itemsError) {
      throw new AppError(itemsError.message, 'PROCUREMENT_NEED_ITEMS_CREATE_FAILED')
    }

    return getNeed(createdNeed.id)
  } catch (error) {
    throw toProcurementNeedServiceError(
      error,
      'Failed to create procurement need',
      'PROCUREMENT_NEED_CREATE_FAILED',
    )
  }
}

export async function cancelNeed(id: string): Promise<ProcurementNeed> {
  try {
    const { data, error } = await supabase
      .from('procurement_needs')
      .update({ status: PROCUREMENT_NEED_STATUS.CANCELLED })
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) {
      throw new AppError(error?.message ?? 'Need not found', 'PROCUREMENT_NEED_CANCEL_FAILED')
    }

    return data as ProcurementNeed
  } catch (error) {
    throw toProcurementNeedServiceError(
      error,
      'Failed to cancel procurement need',
      'PROCUREMENT_NEED_CANCEL_FAILED',
    )
  }
}

export async function convertNeedToPurchaseOrders(
  needId: string,
  userId: string,
): Promise<PurchaseOrderWithDetails[]> {
  try {
    const need = await getNeed(needId)

    if (need.status !== PROCUREMENT_NEED_STATUS.OPEN) {
      throw new AppError('Only open needs can be converted', 'PROCUREMENT_NEED_NOT_OPEN')
    }

    if (need.procurement_need_items.length === 0) {
      throw new AppError('Need has no items', 'PROCUREMENT_NEED_EMPTY_ITEMS')
    }

    const productIds = need.procurement_need_items.map((item) => item.product_id)
    const { data: suppliers, error: suppliersError } = await supabase
      .from('product_suppliers')
      .select('product_id, supplier_id, unit_price, is_preferred, package_size')
      .in('product_id', productIds)
      .order('is_preferred', { ascending: false })
      .order('created_at', { ascending: true })

    if (suppliersError) {
      throw new AppError(suppliersError.message, 'PRODUCT_SUPPLIERS_LIST_FAILED')
    }

    const supplierChoices = (suppliers ?? []) as ProductSupplierChoice[]
    const grouped = new Map<string, GroupedNeedItem[]>()

    for (const item of need.procurement_need_items) {
      const supplier = selectSupplierForProduct(item, supplierChoices)
      const group = grouped.get(supplier.supplier_id) ?? []
      group.push({ item, supplier })
      grouped.set(supplier.supplier_id, group)
    }

    const { data: orders, error: ordersError } = await supabase
      .from('purchase_orders')
      .insert(
        Array.from(grouped.keys()).map((supplierId) => ({
          supplier_id: supplierId,
          status: PURCHASE_ORDER_STATUS.DRAFT,
          order_date: todayISODate(),
          note: need.title,
          source_need_id: need.id,
          created_by: userId,
        })),
      )
      .select('id, supplier_id')

    if (ordersError || !orders) {
      throw new AppError(
        ordersError?.message ?? 'Purchase orders not created',
        'PURCHASE_ORDERS_CREATE_FAILED',
      )
    }

    const orderRows = orders as Array<{ id: string; supplier_id: string }>
    const orderItems = orderRows.flatMap((order) =>
      (grouped.get(order.supplier_id) ?? []).map(({ item, supplier }) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: supplier.unit_price,
        note: normalizeNote(item.note),
      })),
    )

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(orderItems)

    if (itemsError) {
      throw new AppError(itemsError.message, 'PURCHASE_ORDER_ITEMS_CREATE_FAILED')
    }

    const { error: needUpdateError } = await supabase
      .from('procurement_needs')
      .update({ status: PROCUREMENT_NEED_STATUS.CONVERTED })
      .eq('id', need.id)

    if (needUpdateError) {
      throw new AppError(needUpdateError.message, 'PROCUREMENT_NEED_CONVERT_FAILED')
    }

    return fetchOrdersByIds(orderRows.map((order) => order.id))
  } catch (error) {
    throw toProcurementNeedServiceError(
      error,
      'Failed to convert procurement need',
      'PROCUREMENT_NEED_CONVERT_FAILED',
    )
  }
}
