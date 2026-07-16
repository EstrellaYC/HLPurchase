import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/query/keys'
import {
  listInventory,
  updateStock,
  type ListInventoryOptions,
  type UpdateStockInput,
} from '@/features/inventory/services/inventory.service'

export function useInventoryQuery(options: ListInventoryOptions = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.inventory.all, options] as const,
    queryFn: () => listInventory(options),
  })
}

export function useUpdateStockMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateStockInput) => updateStock(input),
    onSuccess: (log) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.inventory.detail(log.product_id) })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.all })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.lowStock })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.purchaseOrders.today })
    },
  })
}
