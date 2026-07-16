import { useTranslation } from 'react-i18next'
import { PURCHASE_ORDER_STATUS } from '@/shared/constants/status'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { formatMoney, formatQuantity } from '@/shared/utils/format'
import type { PurchaseOrderStatus } from '@/shared/constants/status'
import type { PurchaseOrderWithDetails } from '@/shared/types/database'

type PurchaseOrderCardProps = {
  order: PurchaseOrderWithDetails
  canManage?: boolean
  onStatusChange?: (orderId: string, status: PurchaseOrderStatus) => void
  disabled?: boolean
}

const statusTone: Record<
  PurchaseOrderStatus,
  'neutral' | 'success' | 'warning' | 'danger' | 'brand'
> = {
  [PURCHASE_ORDER_STATUS.DRAFT]: 'neutral',
  [PURCHASE_ORDER_STATUS.CONFIRMED]: 'brand',
  [PURCHASE_ORDER_STATUS.ORDERED]: 'warning',
  [PURCHASE_ORDER_STATUS.RECEIVED]: 'success',
  [PURCHASE_ORDER_STATUS.CANCELLED]: 'danger',
}

function getNextAction(status: PurchaseOrderStatus):
  | { status: PurchaseOrderStatus; labelKey: string }
  | null {
  switch (status) {
    case PURCHASE_ORDER_STATUS.DRAFT:
      return { status: PURCHASE_ORDER_STATUS.CONFIRMED, labelKey: 'procurementToday.confirm' }
    case PURCHASE_ORDER_STATUS.CONFIRMED:
      return { status: PURCHASE_ORDER_STATUS.ORDERED, labelKey: 'procurementToday.markOrdered' }
    case PURCHASE_ORDER_STATUS.ORDERED:
      return { status: PURCHASE_ORDER_STATUS.RECEIVED, labelKey: 'procurementToday.markReceived' }
    case PURCHASE_ORDER_STATUS.RECEIVED:
    case PURCHASE_ORDER_STATUS.CANCELLED:
      return null
    default:
      return status satisfies never
  }
}

export function PurchaseOrderCard({
  order,
  canManage = false,
  onStatusChange,
  disabled = false,
}: PurchaseOrderCardProps) {
  const { t, i18n } = useTranslation()
  const nextAction = getNextAction(order.status)
  const total = order.purchase_order_items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  )

  return (
    <article className="list-row">
      <div className="stack">
        <div className="row">
          <h3 className="list-row__title">{order.suppliers.name}</h3>
          <Badge tone={statusTone[order.status]}>
            {t(`procurementToday.status.${order.status}`)}
          </Badge>
        </div>
        <p className="list-row__meta">
          {order.order_date}
          {order.suppliers.contact_name ? ` · ${order.suppliers.contact_name}` : ''}
          {order.suppliers.phone ? ` · ${order.suppliers.phone}` : ''}
        </p>
        <ul className="stack">
          {order.purchase_order_items.map((item) => {
            const productName = i18n.language.startsWith('en')
              ? item.products.name_en
              : item.products.name_zh
            return (
              <li key={item.id} className="row-between">
                <span>{productName}</span>
                <span className="muted">
                  {formatQuantity(item.quantity, item.products.unit)} ·{' '}
                  {formatMoney(item.quantity * item.unit_price)}
                </span>
              </li>
            )
          })}
        </ul>
        <p className="list-row__meta">
          {t('common.total')}: {formatMoney(total)}
        </p>
      </div>

      {canManage && nextAction ? (
        <Button
          type="button"
          size="sm"
          onClick={() => onStatusChange?.(order.id, nextAction.status)}
          disabled={disabled || !onStatusChange}
        >
          {t(nextAction.labelKey)}
        </Button>
      ) : null}
    </article>
  )
}
