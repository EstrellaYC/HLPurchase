import { supabase } from '@/lib/supabase/client'
import { AppError } from '@/shared/lib/errors'
import type { UserRole } from '@/shared/constants/roles'
import type { Profile } from '@/shared/types/database'

export type UpdateUserInput = {
  display_name?: string
  role?: UserRole
  is_active?: boolean
}

function toUserServiceError(error: unknown, fallback: string, code: string): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error && error.message) {
    return new AppError(error.message, code)
  }

  return new AppError(fallback, code)
}

export async function listUsers(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('display_name', { ascending: true })

    if (error) {
      throw new AppError(error.message, 'USERS_LIST_FAILED')
    }

    return (data ?? []) as Profile[]
  } catch (error) {
    throw toUserServiceError(error, 'Failed to load users', 'USERS_LIST_FAILED')
  }
}

export async function updateUser(id: string, values: UpdateUserInput): Promise<Profile> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(values)
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) {
      throw new AppError(error?.message ?? 'User not found', 'USER_UPDATE_FAILED')
    }

    return data as Profile
  } catch (error) {
    throw toUserServiceError(error, 'Failed to update user', 'USER_UPDATE_FAILED')
  }
}
