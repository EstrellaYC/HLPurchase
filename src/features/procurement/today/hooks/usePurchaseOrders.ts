import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/query/keys'
import {
  getOrder,
  listOrders,
  listTodayOrders,
  updateOrderStatus,
  type ListOrdersOptions,
} from '@/features/procurement/today/services/purchase-order.service'
import type { PurchaseOrderStatus } from '@/shared/constants/status'

type UpdateOrderStatusMutationInput = {
  orderId: string
  status: PurchaseOrderStatus
}

export function useTodayOrdersQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.purchaseOrders.today,
    queryFn: listTodayOrders,
  })
}

export function usePurchaseOrdersQuery(options: ListOrdersOptions = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.purchaseOrders.all, options] as const,
    queryFn: () => listOrders(options),
  })
}

export function usePurchaseOrderQuery(id: string | null) {
  return useQuery({
    queryKey: id
      ? QUERY_KEYS.purchaseOrders.detail(id)
      : [...QUERY_KEYS.purchaseOrders.all, 'empty'] as const,
    queryFn: () => {
      if (!id) {
        throw new Error('Purchase order id is required')
      }
      return getOrder(id)
    },
    enabled: Boolean(id),
  })
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, status }: UpdateOrderStatusMutationInput) =>
      updateOrderStatus(orderId, status),
    onSuccess: (order) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.purchaseOrders.detail(order.id) })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.purchaseOrders.all })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.purchaseOrders.today })
    },
  })
}
