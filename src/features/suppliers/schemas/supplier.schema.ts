import { z } from 'zod'

const emailValueSchema = z.string().email()
const optionalEmailSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || emailValueSchema.safeParse(value).success)

export const supplierSchema = z.object({
  name: z.string().trim().min(1),
  contact_name: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: optionalEmailSchema.optional(),
  wechat: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  is_active: z.boolean(),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>
