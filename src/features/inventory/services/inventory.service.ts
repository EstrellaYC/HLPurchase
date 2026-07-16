import { supabase } from '@/lib/supabase/client'
import { INVENTORY_CHANGE_TYPE } from '@/shared/constants/status'
import { AppError } from '@/shared/lib/errors'
import type { InventoryChangeType } from '@/shared/constants/status'
import type { InventoryLog, InventoryWithProduct } from '@/shared/types/database'

export type ListInventoryOptions = {
  search?: string
  lowOnly?: boolean
}

export type UpdateStockInput = {
  productId: string
  quantity: number
  changeType: InventoryChangeType
  note?: string | null
  userId: string
}

function toInventoryServiceError(error: unknown, fallback: string, code: string): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error && error.message) {
    return new AppError(error.message, code)
  }

  return new AppError(fallback, code)
}

function matchesInventorySearch(item: InventoryWithProduct, search: string): boolean {
  const normalized = search.trim().toLowerCase()
  if (!normalized) {
    return true
  }

  const product = item.products
  const category = product.categories
  return [
    product.name_zh,
    product.name_en,
    product.sku ?? '',
    category?.name_zh ?? '',
    category?.name_en ?? '',
  ].some((value) => value.toLowerCase().includes(normalized))
}

function calculateQuantityAfter(input: UpdateStockInput, quantityBefore: number): number {
  switch (input.changeType) {
    case INVENTORY_CHANGE_TYPE.COUNT:
    case INVENTORY_CHANGE_TYPE.ADJUST:
      return input.quantity
    case INVENTORY_CHANGE_TYPE.RECEIVE:
      return quantityBefore + input.quantity
    case INVENTORY_CHANGE_TYPE.WASTE: {
      const nextQuantity = quantityBefore - input.quantity
      if (nextQuantity < 0) {
        throw new AppError('Stock cannot be negative', 'INVENTORY_NEGATIVE_STOCK')
      }
      return nextQuantity
    }
    default:
      return input.changeType satisfies never
  }
}

export async function listInventory(
  options: ListInventoryOptions = {},
): Promise<InventoryWithProduct[]> {
  try {
    const { data, error } = await supabase
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
      )
      .order('updated_at', { ascending: false })

    if (error) {
      throw new AppError(error.message, 'INVENTORY_LIST_FAILED')
    }

    return ((data ?? []) as InventoryWithProduct[]).filter((item) => {
      const matchesSearch = options.search
        ? matchesInventorySearch(item, options.search)
        : true
      const matchesLow = options.lowOnly
        ? item.quantity < item.products.min_stock
        : true
      return matchesSearch && matchesLow
    })
  } catch (error) {
    throw toInventoryServiceError(
      error,
      'Failed to load inventory',
      'INVENTORY_LIST_FAILED',
    )
  }
}

export async function updateStock(input: UpdateStockInput): Promise<InventoryLog> {
  try {
    if (input.quantity < 0) {
      throw new AppError('Quantity must be greater than or equal to 0', 'INVALID_QUANTITY')
    }

    const { data: current, error: currentError } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', input.productId)
      .single()

    if (currentError || !current) {
      throw new AppError(
        currentError?.message ?? 'Inventory item not found',
        'INVENTORY_NOT_FOUND',
      )
    }

    const quantityBefore = Number(current.quantity)
    const quantityAfter = calculateQuantityAfter(input, quantityBefore)
    const delta = Number((quantityAfter - quantityBefore).toFixed(2))

    const { error: updateError } = await supabase
      .from('inventory')
      .update({
        quantity: quantityAfter,
        updated_by: input.userId,
      })
      .eq('product_id', input.productId)

    if (updateError) {
      throw new AppError(updateError.message, 'INVENTORY_UPDATE_FAILED')
    }

    const { data: log, error: logError } = await supabase
      .from('inventory_logs')
      .insert({
        product_id: input.productId,
        change_type: input.changeType,
        quantity_before: quantityBefore,
        quantity_after: quantityAfter,
        delta,
        note: input.note?.trim() ? input.note.trim() : null,
        created_by: input.userId,
      })
      .select('*')
      .single()

    if (logError || !log) {
      throw new AppError(logError?.message ?? 'Stock log not created', 'INVENTORY_LOG_FAILED')
    }

    return log as InventoryLog
  } catch (error) {
    throw toInventoryServiceError(
      error,
      'Failed to update stock',
      'INVENTORY_UPDATE_FAILED',
    )
  }
}
