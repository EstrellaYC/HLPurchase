import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { PurchaseOrderCard } from '@/features/procurement/today/components/PurchaseOrderCard'
import {
  useTodayOrdersQuery,
  useUpdateOrderStatusMutation,
} from '@/features/procurement/today/hooks/usePurchaseOrders'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Spinner } from '@/shared/components/ui/Spinner'
import { getErrorMessage } from '@/shared/lib/errors'
import type { PurchaseOrderStatus } from '@/shared/constants/status'

export function TodayProcurementPage() {
  const { t } = useTranslation()
  const { canManage } = useAuth()
  const ordersQuery = useTodayOrdersQuery()
  const updateStatusMutation = useUpdateOrderStatusMutation()

  const updateStatus = async (orderId: string, status: PurchaseOrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status })
      toast.success(t('procurementToday.updated'))
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    }
  }

  return (
    <section>
      <header className="page-header">
        <h1>{t('procurementToday.title')}</h1>
        <p>{t('procurementToday.subtitle')}</p>
      </header>

      {ordersQuery.isLoading ? <Spinner label={t('common.loading')} /> : null}

      {ordersQuery.isError ? (
        <EmptyState
          title={t('errors.generic')}
          description={getErrorMessage(ordersQuery.error)}
          action={
            <Button type="button" onClick={() => void ordersQuery.refetch()}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : null}

      {ordersQuery.data && ordersQuery.data.length > 0 ? (
        <div className="list-panel">
          {ordersQuery.data.map((order) => (
            <PurchaseOrderCard
              key={order.id}
              order={order}
              canManage={canManage}
              onStatusChange={(orderId, status) => void updateStatus(orderId, status)}
              disabled={updateStatusMutation.isPending}
            />
          ))}
        </div>
      ) : null}

      {ordersQuery.data && ordersQuery.data.length === 0 ? (
        <EmptyState title={t('procurementToday.empty')} />
      ) : null}
    </section>
  )
}
