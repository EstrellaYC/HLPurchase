import { z } from 'zod'
import { INVENTORY_CHANGE_TYPE } from '@/shared/constants/status'

export const updateInventorySchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().min(0),
  change_type: z.enum([
    INVENTORY_CHANGE_TYPE.COUNT,
    INVENTORY_CHANGE_TYPE.RECEIVE,
    INVENTORY_CHANGE_TYPE.ADJUST,
    INVENTORY_CHANGE_TYPE.WASTE,
  ]),
  note: z.string().trim().optional(),
})

export type UpdateInventoryFormValues = z.infer<typeof updateInventorySchema>
