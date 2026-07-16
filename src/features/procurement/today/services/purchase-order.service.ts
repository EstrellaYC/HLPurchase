import { supabase } from '@/lib/supabase/client'
import { AppError } from '@/shared/lib/errors'
import { todayISODate } from '@/shared/utils/format'
import type { PurchaseOrderStatus } from '@/shared/constants/status'
import type { PurchaseOrder, PurchaseOrderWithDetails } from '@/shared/types/database'

export type ListOrdersOptions = {
  date?: string
  status?: PurchaseOrderStatus
}

function toPurchaseOrderServiceError(
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

function orderDetailsSelect(): string {
  return `
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
  `
}

export async function listOrders(
  options: ListOrdersOptions = {},
): Promise<PurchaseOrderWithDetails[]> {
  try {
    let query = supabase
      .from('purchase_orders')
      .select(orderDetailsSelect())
      .order('order_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (options.date) {
      query = query.eq('order_date', options.date)
    }

    if (options.status) {
      query = query.eq('status', options.status)
    }

    const { data, error } = await query

    if (error) {
      throw new AppError(error.message, 'PURCHASE_ORDERS_LIST_FAILED')
    }

    return (data ?? []) as unknown as PurchaseOrderWithDetails[]
  } catch (error) {
    throw toPurchaseOrderServiceError(
      error,
      'Failed to load purchase orders',
      'PURCHASE_ORDERS_LIST_FAILED',
    )
  }
}

export function listTodayOrders(): Promise<PurchaseOrderWithDetails[]> {
  return listOrders({ date: todayISODate() })
}

export async function getOrder(id: string): Promise<PurchaseOrderWithDetails> {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(orderDetailsSelect())
      .eq('id', id)
      .single()

    if (error || !data) {
      throw new AppError(error?.message ?? 'Purchase order not found', 'PURCHASE_ORDER_NOT_FOUND')
    }

    return data as unknown as PurchaseOrderWithDetails
  } catch (error) {
    throw toPurchaseOrderServiceError(
      error,
      'Failed to load purchase order',
      'PURCHASE_ORDER_NOT_FOUND',
    )
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: PurchaseOrderStatus,
): Promise<PurchaseOrder> {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({ status })
      .eq('id', orderId)
      .select('*')
      .single()

    if (error || !data) {
      throw new AppError(error?.message ?? 'Purchase order not found', 'PURCHASE_ORDER_UPDATE_FAILED')
    }

    return data as PurchaseOrder
  } catch (error) {
    throw toPurchaseOrderServiceError(
      error,
      'Failed to update purchase order',
      'PURCHASE_ORDER_UPDATE_FAILED',
    )
  }
}
