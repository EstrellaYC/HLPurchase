import { create } from 'zustand'
import type { Profile } from '@/shared/types/database'
import type { Session } from '@supabase/supabase-js'

type AuthState = {
  session: Session | null
  profile: Profile | null
  initialized: boolean
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setInitialized: (initialized: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  initialized: false,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setInitialized: (initialized) => set({ initialized }),
  reset: () => set({ session: null, profile: null }),
}))
