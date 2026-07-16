import { z } from 'zod'
import { USER_ROLES } from '@/shared/constants/roles'

export const updateUserSchema = z.object({
  display_name: z.string().trim().min(1),
  role: z.enum([USER_ROLES.OWNER, USER_ROLES.MANAGER, USER_ROLES.STAFF]),
  is_active: z.boolean(),
})

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
