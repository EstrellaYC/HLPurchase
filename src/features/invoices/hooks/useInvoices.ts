import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/query/keys'
import {
  createInvoice,
  listInvoices,
  updateInvoiceStatus,
} from '@/features/invoices/services/invoice.service'
import type { InvoiceFormValues } from '@/features/invoices/schemas/invoice.schema'
import type { InvoiceStatus } from '@/shared/constants/status'

export function useInvoices() {
  return useQuery({
    queryKey: QUERY_KEYS.invoices.all,
    queryFn: listInvoices,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ values, userId }: { values: InvoiceFormValues; userId: string }) =>
      createInvoice(values, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoices.all })
    },
  })
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      updateInvoiceStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoices.all })
    },
  })
}
