import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/query/keys'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '@/features/categories/services/category.service'
import type {
  CategoryInput,
  UpdateCategoryInput,
} from '@/features/categories/services/category.service'

type UpdateCategoryMutationInput = {
  id: string
  values: UpdateCategoryInput
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.categories.all,
    queryFn: listCategories,
  })
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: CategoryInput) => createCategory(values),
    onSuccess: (category) => {
      queryClient.setQueryData(QUERY_KEYS.categories.detail(category.id), category)
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.all })
    },
  })
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: UpdateCategoryMutationInput) =>
      updateCategory(id, values),
    onSuccess: (category) => {
      queryClient.setQueryData(QUERY_KEYS.categories.detail(category.id), category)
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.all })
    },
  })
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.categories.detail(id) })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.all })
    },
  })
}
