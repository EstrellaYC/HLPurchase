import { useTranslation } from 'react-i18next'
import { PROCUREMENT_NEED_STATUS } from '@/shared/constants/status'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { formatQuantity } from '@/shared/utils/format'
import type { ProcurementNeedStatus } from '@/shared/constants/status'
import type { ProcurementNeedWithItems } from '@/shared/types/database'

type NeedCardProps = {
  need: ProcurementNeedWithItems
  canConvert?: boolean
  onConvert?: (need: ProcurementNeedWithItems) => void
  onCancel?: (need: ProcurementNeedWithItems) => void
  disabled?: boolean
}

const statusTone: Record<ProcurementNeedStatus, 'neutral' | 'success' | 'danger'> = {
  [PROCUREMENT_NEED_STATUS.OPEN]: 'neutral',
  [PROCUREMENT_NEED_STATUS.CONVERTED]: 'success',
  [PROCUREMENT_NEED_STATUS.CANCELLED]: 'danger',
}

export function NeedCard({
  need,
  canConvert = false,
  onConvert,
  onCancel,
  disabled = false,
}: NeedCardProps) {
  const { t, i18n } = useTranslation()
  const isOpen = need.status === PROCUREMENT_NEED_STATUS.OPEN

  return (
    <article className="list-row">
      <div className="stack">
        <div className="row">
          <h3 className="list-row__title">{need.title}</h3>
          <Badge tone={statusTone[need.status]}>
            {t(`procurementNeeds.status.${need.status}`)}
          </Badge>
        </div>
        <p className="list-row__meta">
          {need.needed_date ? `${t('procurementNeeds.neededDate')}: ${need.needed_date}` : ''}
          {need.note ? `${need.needed_date ? ' · ' : ''}${need.note}` : ''}
        </p>
        <ul className="stack">
          {need.procurement_need_items.map((item) => {
            const productName = i18n.language.startsWith('en')
              ? item.products.name_en
              : item.products.name_zh
            return (
              <li key={item.id} className="row-between">
                <span>{productName}</span>
                <span className="muted">
                  {formatQuantity(item.quantity, item.products.unit)}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {isOpen ? (
        <div className="stack">
          {canConvert ? (
            <Button
              type="button"
              size="sm"
              onClick={() => onConvert?.(need)}
              disabled={disabled || !onConvert}
            >
              {t('procurementNeeds.convert')}
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onCancel?.(need)}
            disabled={disabled || !onCancel}
          >
            {t('common.cancel')}
          </Button>
        </div>
      ) : null}
    </article>
  )
}
