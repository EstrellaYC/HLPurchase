import { supabase } from '@/lib/supabase/client'
import { PURCHASE_ORDER_STATUS } from '@/shared/constants/status'
import { AppError } from '@/shared/lib/errors'
import { todayISODate } from '@/shared/utils/format'
import type {
  InventoryWithProduct,
  PurchaseOrderWithDetails,
  Supplier,
} from '@/shared/types/database'
import type {
  SmartProductSupplier,
  SmartSuggestion,
} from '@/features/procurement/smart/smart-procurement.algorithm'

export type SmartProcurementContext = {
  inventory: InventoryWithProduct[]
  productSuppliers: SmartProductSupplier[]
  suppliers: Supplier[]
}

function toSmartProcurementServiceError(
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

export async function fetchSmartContext(): Promise<SmartProcurementContext> {
  try {
    const [inventoryResult, productSuppliersResult, suppliersResult] = await Promise.all([
      supabase
        .from('inventory')
        .select(
          `
          *,
          products (
            *,
            categories (
              id,
              name_zh,
              name_en
            )
          )
        `,
        ),
      supabase
        .from('product_suppliers')
        .select('product_id, supplier_id, unit_price, is_preferred, package_size')
        .order('is_preferred', { ascending: false })
        .order('unit_price', { ascending: true }),
      supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true }),
    ])

    if (inventoryResult.error) {
      throw new AppError(inventoryResult.error.message, 'INVENTORY_LIST_FAILED')
    }

    if (productSuppliersResult.error) {
      throw new AppError(
        productSuppliersResult.error.message,
        'PRODUCT_SUPPLIERS_LIST_FAILED',
      )
    }

    if (suppliersResult.error) {
      throw new AppError(suppliersResult.error.message, 'SUPPLIERS_LIST_FAILED')
    }

    return {
      inventory: (inventoryResult.data ?? []) as InventoryWithProduct[],
      productSuppliers: (productSuppliersResult.data ?? []) as SmartProductSupplier[],
      suppliers: (suppliersResult.data ?? []) as Supplier[],
    }
  } catch (error) {
    throw toSmartProcurementServiceError(
      error,
      'Failed to load smart procurement context',
      'SMART_PROCUREMENT_CONTEXT_FAILED',
    )
  }
}

export async function applySuggestions(
  suggestions: SmartSuggestion[],
  userId: string,
): Promise<PurchaseOrderWithDetails[]> {
  try {
    if (suggestions.length === 0) {
      throw new AppError('No suggestions to apply', 'SMART_PROCUREMENT_EMPTY')
    }

    const grouped = new Map<string, SmartSuggestion[]>()
    for (const suggestion of suggestions) {
      const supplierSuggestions = grouped.get(suggestion.supplier_id) ?? []
      supplierSuggestions.push(suggestion)
      grouped.set(suggestion.supplier_id, supplierSuggestions)
    }

    const { data: orders, error: ordersError } = await supabase
      .from('purchase_orders')
      .insert(
        Array.from(grouped.keys()).map((supplierId) => ({
          supplier_id: supplierId,
          status: PURCHASE_ORDER_STATUS.DRAFT,
          order_date: todayISODate(),
          note: 'Smart procurement',
          source_need_id: null,
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
      (grouped.get(order.supplier_id) ?? []).map((suggestion) => ({
        order_id: order.id,
        product_id: suggestion.product_id,
        quantity: suggestion.suggested_quantity,
        unit_price: suggestion.unit_price,
        note: null,
      })),
    )

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(orderItems)

    if (itemsError) {
      throw new AppError(itemsError.message, 'PURCHASE_ORDER_ITEMS_CREATE_FAILED')
    }

    return fetchOrdersByIds(orderRows.map((order) => order.id))
  } catch (error) {
    throw toSmartProcurementServiceError(
      error,
      'Failed to create smart procurement orders',
      'SMART_PROCUREMENT_APPLY_FAILED',
    )
  }
}
