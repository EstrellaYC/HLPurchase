import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/query/keys'
import {
  createSupplier,
  deactivateSupplier,
  listSuppliers,
  updateSupplier,
} from '@/features/suppliers/services/supplier.service'
import type { SupplierFormValues } from '@/features/suppliers/schemas/supplier.schema'

type UpdateSupplierVariables = {
  id: string
  values: SupplierFormValues
}

export function useSuppliers(search?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.suppliers.all, { search: search ?? '' }] as const,
    queryFn: () => listSuppliers(search),
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSupplier,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.suppliers.all })
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: UpdateSupplierVariables) =>
      updateSupplier(id, values),
    onSuccess: async (_supplier, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.suppliers.all }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.suppliers.detail(variables.id),
        }),
      ])
    },
  })
}

export function useDeactivateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deactivateSupplier,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.suppliers.all })
    },
  })
}
