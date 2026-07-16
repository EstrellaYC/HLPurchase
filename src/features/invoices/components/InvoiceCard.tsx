import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { INVOICE_STATUS } from '@/shared/constants/status'
import { formatMoney } from '@/shared/utils/format'
import type { InvoiceWithDetails } from '@/shared/types/database'
import type { InvoiceStatus } from '@/shared/constants/status'

type InvoiceCardProps = {
  invoice: InvoiceWithDetails
  canManage: boolean
  onStatusChange: (status: InvoiceStatus) => void
}

function statusTone(status: InvoiceStatus) {
  if (status === INVOICE_STATUS.VERIFIED) return 'success' as const
  if (status === INVOICE_STATUS.DISPUTED) return 'danger' as const
  return 'warning' as const
}

export function InvoiceCard({ invoice, canManage, onStatusChange }: InvoiceCardProps) {
  const { t } = useTranslation()

  return (
    <article className="list-row">
      <div>
        <div className="list-row__title">
          {invoice.invoice_number || invoice.suppliers.name}
        </div>
        <div className="list-row__meta">
          {invoice.suppliers.name} · {invoice.invoice_date} ·{' '}
          {formatMoney(invoice.total_amount)}
        </div>
        {invoice.note ? <div className="list-row__meta">{invoice.note}</div> : null}
      </div>
      <div className="stack" style={{ alignItems: 'flex-end' }}>
        <Badge tone={statusTone(invoice.status)}>
          {t(`invoices.status.${invoice.status}`)}
        </Badge>
        {canManage && invoice.status === INVOICE_STATUS.PENDING ? (
          <div className="row">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => onStatusChange(INVOICE_STATUS.VERIFIED)}
            >
              {t('invoices.verify')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onStatusChange(INVOICE_STATUS.DISPUTED)}
            >
              {t('invoices.dispute')}
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  )
}
