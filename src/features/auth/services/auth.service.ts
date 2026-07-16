import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { AppError } from '@/shared/lib/errors'
import type { Profile } from '@/shared/types/database'
import type { LoginFormValues } from '@/features/auth/schemas/login.schema'
import type { Session, User } from '@supabase/supabase-js'

export async function signIn(values: LoginFormValues): Promise<Session> {
  if (!isSupabaseConfigured) {
    throw new AppError('Supabase is not configured', 'NOT_CONFIGURED')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: values.email.trim(),
    password: values.password,
  })

  if (error || !data.session) {
    throw new AppError(error?.message ?? 'Invalid credentials', 'AUTH_FAILED')
  }

  return data.session
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new AppError(error.message, 'AUTH_SIGNOUT_FAILED')
  }
}

export async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured) {
    return null
  }

  const { data, error } = await supabase.auth.getSession()
  if (error) {
    throw new AppError(error.message, 'AUTH_SESSION_FAILED')
  }
  return data.session
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user ?? null
}

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) {
    throw new AppError(error?.message ?? 'Profile not found', 'PROFILE_NOT_FOUND')
  }

  return data as Profile
}
