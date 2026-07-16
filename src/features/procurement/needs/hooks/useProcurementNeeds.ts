import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/query/keys'
import {
  cancelNeed,
  convertNeedToPurchaseOrders,
  createNeed,
  getNeed,
  listNeedProducts,
  listNeeds,
  type CreateNeedInput,
} from '@/features/procurement/needs/services/procurement-need.service'

type ConvertNeedMutationInput = {
  needId: string
  userId: string
}

export function useProcurementNeedsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.procurementNeeds.all,
    queryFn: listNeeds,
  })
}

export function useProcurementNeedQuery(id: string | null) {
  return useQuery({
    queryKey: id
      ? QUERY_KEYS.procurementNeeds.detail(id)
      : [...QUERY_KEYS.procurementNeeds.all, 'empty'] as const,
    queryFn: () => {
      if (!id) {
        throw new Error('Need id is required')
      }
      return getNeed(id)
    },
    enabled: Boolean(id),
  })
}

export function useNeedProductsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.products.all,
    queryFn: listNeedProducts,
  })
}

export function useCreateNeedMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateNeedInput) => createNeed(input),
    onSuccess: (need) => {
      queryClient.setQueryData(QUERY_KEYS.procurementNeeds.detail(need.id), need)
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.procurementNeeds.all })
    },
  })
}

export function useCancelNeedMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cancelNeed(id),
    onSuccess: (need) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.procurementNeeds.detail(need.id) })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.procurementNeeds.all })
    },
  })
}

export function useConvertNeedMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ needId, userId }: ConvertNeedMutationInput) =>
      convertNeedToPurchaseOrders(needId, userId),
    onSuccess: (_orders, input) => {
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.procurementNeeds.detail(input.needId),
      })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.procurementNeeds.all })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.purchaseOrders.all })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.purchaseOrders.today })
    },
  })
}
