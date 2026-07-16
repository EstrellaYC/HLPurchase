import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { CategoryCard } from '@/features/categories/components/CategoryCard'
import { CategoryForm } from '@/features/categories/components/CategoryForm'
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '@/features/categories/hooks/useCategories'
import type { CategoryFormValues } from '@/features/categories/schemas/category.schema'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Modal } from '@/shared/components/ui/Modal'
import { SearchInput } from '@/shared/components/ui/SearchInput'
import { Spinner } from '@/shared/components/ui/Spinner'
import { getErrorMessage } from '@/shared/lib/errors'
import type { Category } from '@/shared/types/database'

export function CategoriesPage() {
  const { t } = useTranslation()
  const { canManage } = useAuth()
  const [search, setSearch] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const categoriesQuery = useCategoriesQuery()
  const createCategoryMutation = useCreateCategoryMutation()
  const updateCategoryMutation = useUpdateCategoryMutation()
  const deleteCategoryMutation = useDeleteCategoryMutation()

  useEffect(() => {
    if (categoriesQuery.isError) {
      toast.error(getErrorMessage(categoriesQuery.error, t('errors.generic')))
    }
  }, [categoriesQuery.error, categoriesQuery.isError, t])

  const normalizedSearch = search.trim().toLowerCase()
  const filteredCategories = useMemo(() => {
    const categories = categoriesQuery.data ?? []

    if (!normalizedSearch) {
      return categories
    }

    return categories.filter((category) => {
      const searchable = `${category.name_zh} ${category.name_en}`.toLowerCase()
      return searchable.includes(normalizedSearch)
    })
  }, [categoriesQuery.data, normalizedSearch])

  const openCreateModal = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          values,
        })
      } else {
        await createCategoryMutation.mutateAsync(values)
      }

      toast.success(t('categories.saved'))
      closeModal()
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    }
  }

  const handleDelete = async (category: Category) => {
    try {
      setDeletingId(category.id)
      await deleteCategoryMutation.mutateAsync(category.id)
      toast.success(t('categories.deleted'))
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    } finally {
      setDeletingId(null)
    }
  }

  const isSaving =
    createCategoryMutation.isPending || updateCategoryMutation.isPending

  return (
    <section className="stack-lg">
      <header className="page-header">
        <div className="row-between">
          <div>
            <h1>{t('categories.title')}</h1>
            <p>{t('categories.subtitle')}</p>
          </div>
          {canManage ? (
            <Button type="button" onClick={openCreateModal}>
              {t('categories.create')}
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

      {categoriesQuery.isLoading ? <Spinner label={t('common.loading')} /> : null}

      {!categoriesQuery.isLoading && filteredCategories.length === 0 ? (
        <EmptyState
          title={search ? t('common.noResults') : t('categories.empty')}
          description={canManage ? t('categories.subtitle') : t('permissions.managerOnly')}
          action={
            canManage && !search ? (
              <Button type="button" onClick={openCreateModal}>
                {t('categories.create')}
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {filteredCategories.length > 0 ? (
        <div className="list-panel">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              canManage={canManage}
              deleting={deletingId === category.id}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : null}

      <Modal
        open={isModalOpen}
        title={editingCategory ? t('common.edit') : t('categories.create')}
        onClose={closeModal}
      >
        <CategoryForm
          category={editingCategory}
          loading={isSaving}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      </Modal>
    </section>
  )
}
