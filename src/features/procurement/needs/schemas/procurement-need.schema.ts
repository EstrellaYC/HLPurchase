import { z } from 'zod'

export const procurementNeedItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  note: z.string().trim().optional(),
})

export const procurementNeedSchema = z.object({
  title: z.string().trim().min(1),
  needed_date: z.string().optional(),
  note: z.string().trim().optional(),
  items: z.array(procurementNeedItemSchema).min(1),
})

export type ProcurementNeedFormInput = z.input<typeof procurementNeedSchema>
export type ProcurementNeedFormValues = z.infer<typeof procurementNeedSchema>
