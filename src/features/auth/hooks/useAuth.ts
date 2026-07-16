import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/query/keys'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import {
  getProfile,
  getSession,
  signOut as signOutService,
} from '@/features/auth/services/auth.service'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { getErrorMessage } from '@/shared/lib/errors'
import { toast } from 'sonner'
import { isManagerOrAbove, isOwner, type UserRole } from '@/shared/constants/roles'

export function useAuthBootstrap() {
  const setSession = useAuthStore((s) => s.setSession)
  const setProfile = useAuthStore((s) => s.setProfile)
  const setInitialized = useAuthStore((s) => s.setInitialized)
  const queryClient = useQueryClient()

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      try {
        const session = await getSession()
        if (!mounted) return
        setSession(session)

        if (session?.user) {
          const profile = await getProfile(session.user.id)
          if (!mounted) return
          setProfile(profile)
          queryClient.setQueryData(QUERY_KEYS.auth.profile, profile)
        } else {
          setProfile(null)
        }
      } catch (error) {
        toast.error(getErrorMessage(error))
        setSession(null)
        setProfile(null)
      } finally {
        if (mounted) {
          setInitialized(true)
        }
      }
    }

    void bootstrap()

    if (!isSupabaseConfigured) {
      return () => {
        mounted = false
      }
    }

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session?.user) {
        setProfile(null)
        return
      }

      void getProfile(session.user.id)
        .then((profile) => {
          setProfile(profile)
          queryClient.setQueryData(QUERY_KEYS.auth.profile, profile)
        })
        .catch((error: unknown) => {
          toast.error(getErrorMessage(error))
        })
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [queryClient, setInitialized, setProfile, setSession])
}

export function useAuth() {
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const initialized = useAuthStore((s) => s.initialized)
  const role = (profile?.role ?? null) as UserRole | null

  const profileQuery = useQuery({
    queryKey: QUERY_KEYS.auth.profile,
    queryFn: async () => {
      if (!session?.user) {
        return null
      }
      return getProfile(session.user.id)
    },
    enabled: Boolean(session?.user),
  })

  const signOut = async () => {
    try {
      await signOutService()
      useAuthStore.getState().reset()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return {
    session,
    profile: profileQuery.data ?? profile,
    initialized,
    isAuthenticated: Boolean(session),
    role,
    canManage: isManagerOrAbove(role),
    isOwner: isOwner(role),
    signOut,
  }
}
