import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/query/keys'
import { listUsers, updateUser } from '@/features/users/services/user.service'
import type { UpdateUserInput } from '@/features/users/services/user.service'

type UpdateUserMutationInput = {
  id: string
  values: UpdateUserInput
}

type UseUsersQueryOptions = {
  enabled?: boolean
}

export function useUsersQuery(options: UseUsersQueryOptions = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.users.all,
    queryFn: listUsers,
    enabled: options.enabled ?? true,
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: UpdateUserMutationInput) => updateUser(id, values),
    onSuccess: (profile) => {
      queryClient.setQueryData(QUERY_KEYS.users.detail(profile.id), profile)
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all })
    },
  })
}
