import { z } from 'zod'
import { INVOICE_STATUS } from '@/shared/constants/status'

export const invoiceItemSchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  description: z.string().trim().min(1),
  quantity: z.number().positive(),
  unit_price: z.number().min(0),
})

export const invoiceSchema = z.object({
  supplier_id: z.string().uuid(),
  purchase_order_id: z.string().uuid().nullable().optional(),
  invoice_number: z.string().trim().optional().nullable(),
  invoice_date: z.string().min(1),
  total_amount: z.number().min(0),
  status: z.enum([
    INVOICE_STATUS.PENDING,
    INVOICE_STATUS.VERIFIED,
    INVOICE_STATUS.DISPUTED,
  ]),
  image_url: z.string().nullable().optional(),
  note: z.string().trim().optional().nullable(),
  items: z.array(invoiceItemSchema),
})

export type InvoiceFormValues = z.infer<typeof invoiceSchema>
