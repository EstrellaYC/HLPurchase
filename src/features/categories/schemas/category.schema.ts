import { z } from 'zod'

export const categorySchema = z.object({
  name_zh: z.string().trim().min(1),
  name_en: z.string().trim().min(1),
  sort_order: z.number().int().min(0),
  is_active: z.boolean(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
