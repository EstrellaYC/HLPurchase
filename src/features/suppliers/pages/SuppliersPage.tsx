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
import { SupplierCard } from '@/features/suppliers/components/SupplierCard'
import { SupplierForm } from '@/features/suppliers/components/SupplierForm'
import {
  useCreateSupplier,
  useDeactivateSupplier,
  useSuppliers,
  useUpdateSupplier,
} from '@/features/suppliers/hooks/useSuppliers'
import type { SupplierFormValues } from '@/features/suppliers/schemas/supplier.schema'
import type { Supplier } from '@/shared/types/database'

export function SuppliersPage() {
  const { t } = useTranslation()
  const { canManage } = useAuth()
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const debouncedSearch = useDebouncedValue(search)
  const suppliersQuery = useSuppliers(debouncedSearch)
  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()
  const deactivateSupplier = useDeactivateSupplier()

  const suppliers = suppliersQuery.data ?? []
  const isFormOpen = isCreateOpen || editingSupplier !== null
  const isFormSubmitting = createSupplier.isPending || updateSupplier.isPending

  const closeForm = () => {
    setIsCreateOpen(false)
    setEditingSupplier(null)
  }

  const handleSubmit = async (values: SupplierFormValues) => {
    try {
      if (editingSupplier) {
        await updateSupplier.mutateAsync({
          id: editingSupplier.id,
          values,
        })
      } else {
        await createSupplier.mutateAsync(values)
      }

      toast.success(t('suppliers.saved'))
      closeForm()
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    }
  }

  const handleDeactivate = async (supplier: Supplier) => {
    if (!window.confirm(t('common.confirm'))) {
      return
    }

    try {
      await deactivateSupplier.mutateAsync(supplier.id)
      toast.success(t('suppliers.deleted'))
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    }
  }

  return (
    <section>
      <header className="page-header">
        <div className="row-between">
          <div>
            <h1>{t('suppliers.title')}</h1>
            <p>{t('suppliers.subtitle')}</p>
          </div>
          {canManage ? (
            <Button onClick={() => setIsCreateOpen(true)}>
              {t('suppliers.create')}
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

      {suppliersQuery.isLoading ? (
        <Spinner label={t('common.loading')} />
      ) : suppliersQuery.isError ? (
        <EmptyState
          title={getErrorMessage(suppliersQuery.error, t('errors.generic'))}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                void suppliersQuery.refetch()
              }}
            >
              {t('common.retry')}
            </Button>
          }
        />
      ) : suppliers.length === 0 ? (
        <EmptyState
          title={search ? t('common.noResults') : t('suppliers.empty')}
          action={
            canManage ? (
              <Button onClick={() => setIsCreateOpen(true)}>
                {t('suppliers.create')}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="list-panel">
          {suppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              canManage={canManage}
              onEdit={setEditingSupplier}
              onDeactivate={handleDeactivate}
              deactivateDisabled={deactivateSupplier.isPending}
            />
          ))}
        </div>
      )}

      <Modal
        open={isFormOpen}
        title={editingSupplier ? t('common.edit') : t('suppliers.create')}
        onClose={closeForm}
      >
        <SupplierForm
          key={editingSupplier?.id ?? 'create'}
          initialSupplier={editingSupplier}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          isSubmitting={isFormSubmitting}
        />
      </Modal>
    </section>
  )
}
