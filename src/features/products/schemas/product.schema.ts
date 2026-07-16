import { z } from 'zod'
import { PRODUCT_UNIT_LIST, type ProductUnit } from '@/shared/constants/status'

export const productSchema = z.object({
  name_zh: z.string().trim().min(1),
  name_en: z.string().trim().min(1),
  sku: z.string().trim().optional(),
  category_id: z.string().nullable().optional(),
  unit: z.custom<ProductUnit>(
    (value) =>
      typeof value === 'string' &&
      PRODUCT_UNIT_LIST.includes(value as ProductUnit),
  ),
  min_stock: z.number().min(0),
  is_active: z.boolean(),
  image_url: z.string().trim().optional(),
})

export type ProductFormValues = z.infer<typeof productSchema>
