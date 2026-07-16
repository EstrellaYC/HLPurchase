import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Modal } from '@/shared/components/ui/Modal'
import { SearchInput } from '@/shared/components/ui/SearchInput'
import { Spinner } from '@/shared/components/ui/Spinner'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { getErrorMessage } from '@/shared/lib/errors'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ProductCard } from '@/features/products/components/ProductCard'
import { ProductForm } from '@/features/products/components/ProductForm'
import {
  useCreateProduct,
  useDeleteProduct,
  useProductCategories,
  useProducts,
  useUpdateProduct,
} from '@/features/products/hooks/useProducts'
import type { ProductFormValues } from '@/features/products/schemas/product.schema'
import type { ProductWithCategory } from '@/shared/types/database'

export function ProductsPage() {
  const { t } = useTranslation()
  const { canManage } = useAuth()
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingProduct, setEditingProduct] =
    useState<ProductWithCategory | null>(null)
  const debouncedSearch = useDebouncedValue(search)
  const productsQuery = useProducts(debouncedSearch)
  const categoriesQuery = useProductCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const products = productsQuery.data ?? []
  const categories = categoriesQuery.data ?? []
  const isFormOpen = isCreateOpen || editingProduct !== null
  const isFormSubmitting = createProduct.isPending || updateProduct.isPending

  const closeForm = () => {
    setIsCreateOpen(false)
    setEditingProduct(null)
  }

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          values,
        })
      } else {
        await createProduct.mutateAsync(values)
      }

      toast.success(t('products.saved'))
      closeForm()
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    }
  }

  const handleDelete = async (product: ProductWithCategory) => {
    if (!window.confirm(t('common.confirm'))) {
      return
    }

    try {
      await deleteProduct.mutateAsync(product.id)
      toast.success(t('products.deleted'))
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    }
  }

  return (
    <section>
      <header className="page-header">
        <div className="row-between">
          <div>
            <h1>{t('products.title')}</h1>
            <p>{t('products.subtitle')}</p>
          </div>
          {canManage ? (
            <Button onClick={() => setIsCreateOpen(true)}>
              {t('products.create')}
            </Button>
          ) : null}
        </div>
      </header>

      <div className="toolbar">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('common.search')}
          aria-label={t('common.search')}
        />
      </div>

      {productsQuery.isLoading ? (
        <Spinner label={t('common.loading')} />
      ) : productsQuery.isError ? (
        <EmptyState
          title={getErrorMessage(productsQuery.error, t('errors.generic'))}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                void productsQuery.refetch()
              }}
            >
              {t('common.retry')}
            </Button>
          }
        />
      ) : products.length === 0 ? (
        <EmptyState
          title={search ? t('common.noResults') : t('products.empty')}
          action={
            canManage ? (
              <Button onClick={() => setIsCreateOpen(true)}>
                {t('products.create')}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="list-panel">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              canManage={canManage}
              onEdit={setEditingProduct}
              onDelete={handleDelete}
              deleteDisabled={deleteProduct.isPending}
            />
          ))}
        </div>
      )}

      <Modal
        open={isFormOpen}
        title={editingProduct ? t('common.edit') : t('products.create')}
        onClose={closeForm}
      >
        <ProductForm
          key={editingProduct?.id ?? 'create'}
          initialProduct={editingProduct}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          isSubmitting={isFormSubmitting}
        />
      </Modal>
    </section>
  )
}
