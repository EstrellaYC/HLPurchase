import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/query/keys'
import {
  createProduct,
  deleteProduct,
  listProductCategories,
  listProducts,
  updateProduct,
} from '@/features/products/services/product.service'
import type { ProductFormValues } from '@/features/products/schemas/product.schema'

type UpdateProductVariables = {
  id: string
  values: ProductFormValues
}

export function useProducts(search?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.products.all, { search: search ?? '' }] as const,
    queryFn: () => listProducts(search),
  })
}

export function useProductCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories.all,
    queryFn: listProductCategories,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: UpdateProductVariables) =>
      updateProduct(id, values),
    onSuccess: async (_product, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.products.detail(variables.id),
        }),
      ])
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all })
    },
  })
}
