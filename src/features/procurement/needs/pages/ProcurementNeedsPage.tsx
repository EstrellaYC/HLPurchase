import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { NeedCard } from '@/features/procurement/needs/components/NeedCard'
import { NeedForm } from '@/features/procurement/needs/components/NeedForm'
import {
  useCancelNeedMutation,
  useConvertNeedMutation,
  useCreateNeedMutation,
  useNeedProductsQuery,
  useProcurementNeedsQuery,
} from '@/features/procurement/needs/hooks/useProcurementNeeds'
import type { ProcurementNeedFormValues } from '@/features/procurement/needs/schemas/procurement-need.schema'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Modal } from '@/shared/components/ui/Modal'
import { Spinner } from '@/shared/components/ui/Spinner'
import { getErrorMessage } from '@/shared/lib/errors'
import type { ProcurementNeedWithItems } from '@/shared/types/database'

function normalizeOptionalText(value: string | undefined): string | null {
  return value?.trim() ? value.trim() : null
}

export function ProcurementNeedsPage() {
  const { t } = useTranslation()
  const { session, canManage } = useAuth()
  const needsQuery = useProcurementNeedsQuery()
  const productsQuery = useNeedProductsQuery()
  const createNeedMutation = useCreateNeedMutation()
  const cancelNeedMutation = useCancelNeedMutation()
  const convertNeedMutation = useConvertNeedMutation()
  const [formOpen, setFormOpen] = useState(false)

  const createNeed = async (values: ProcurementNeedFormValues) => {
    if (!session?.user.id) {
      toast.error(t('errors.unauthorized'))
      return
    }

    try {
      await createNeedMutation.mutateAsync({
        title: values.title,
        needed_date: values.needed_date || null,
        note: normalizeOptionalText(values.note),
        created_by: session.user.id,
        items: values.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          note: normalizeOptionalText(item.note),
        })),
      })
      toast.success(t('procurementNeeds.saved'))
      setFormOpen(false)
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    }
  }

  const convertNeed = async (need: ProcurementNeedWithItems) => {
    if (!session?.user.id) {
      toast.error(t('errors.unauthorized'))
      return
    }

    try {
      await convertNeedMutation.mutateAsync({
        needId: need.id,
        userId: session.user.id,
      })
      toast.success(t('procurementNeeds.converted'))
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    }
  }

  const cancelNeed = async (need: ProcurementNeedWithItems) => {
    try {
      await cancelNeedMutation.mutateAsync(need.id)
      toast.success(t('procurementNeeds.saved'))
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    }
  }

  const isMutating =
    createNeedMutation.isPending ||
    cancelNeedMutation.isPending ||
    convertNeedMutation.isPending

  return (
    <section>
      <header className="page-header">
        <div className="row-between">
          <div>
            <h1>{t('procurementNeeds.title')}</h1>
            <p>{t('procurementNeeds.subtitle')}</p>
          </div>
          <Button type="button" onClick={() => setFormOpen(true)}>
            {t('procurementNeeds.create')}
          </Button>
        </div>
      </header>

      {needsQuery.isLoading ? <Spinner label={t('common.loading')} /> : null}

      {needsQuery.isError ? (
        <EmptyState
          title={t('errors.generic')}
          description={getErrorMessage(needsQuery.error)}
          action={
            <Button type="button" onClick={() => void needsQuery.refetch()}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : null}

      {needsQuery.data && needsQuery.data.length > 0 ? (
        <div className="list-panel">
          {needsQuery.data.map((need) => (
            <NeedCard
              key={need.id}
              need={need}
              canConvert={canManage}
              onConvert={(currentNeed) => void convertNeed(currentNeed)}
              onCancel={(currentNeed) => void cancelNeed(currentNeed)}
              disabled={isMutating}
            />
          ))}
        </div>
      ) : null}

      {needsQuery.data && needsQuery.data.length === 0 ? (
        <EmptyState
          title={t('procurementNeeds.empty')}
          action={
            <Button type="button" onClick={() => setFormOpen(true)}>
              {t('procurementNeeds.create')}
            </Button>
          }
        />
      ) : null}

      <Modal
        open={formOpen}
        title={t('procurementNeeds.create')}
        onClose={() => setFormOpen(false)}
      >
        {productsQuery.isLoading ? <Spinner label={t('common.loading')} /> : null}
        {productsQuery.data ? (
          <NeedForm
            products={productsQuery.data}
            onSubmit={createNeed}
            submitting={createNeedMutation.isPending}
          />
        ) : null}
      </Modal>
    </section>
  )
}
