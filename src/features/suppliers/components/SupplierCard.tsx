import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import type { Supplier } from '@/shared/types/database'

type SupplierCardProps = {
  supplier: Supplier
  canManage: boolean
  onEdit: (supplier: Supplier) => void
  onDeactivate: (supplier: Supplier) => void
  deactivateDisabled?: boolean
}

export function SupplierCard({
  supplier,
  canManage,
  onEdit,
  onDeactivate,
  deactivateDisabled = false,
}: SupplierCardProps) {
  const { t } = useTranslation()
  const contact = [
    supplier.contact_name,
    supplier.phone,
    supplier.email,
    supplier.wechat,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <article className="list-row">
      <div>
        <div className="list-row__title">{supplier.name}</div>
        {contact ? <div className="list-row__meta">{contact}</div> : null}
        {supplier.notes ? (
          <div className="list-row__meta">{supplier.notes}</div>
        ) : null}
        <div className="row" style={{ marginTop: '0.5rem' }}>
          <Badge tone={supplier.is_active ? 'success' : 'neutral'}>
            {supplier.is_active ? t('common.active') : t('common.inactive')}
          </Badge>
        </div>
      </div>

      {canManage ? (
        <div className="row">
          <Button size="sm" variant="secondary" onClick={() => onEdit(supplier)}>
            {t('common.edit')}
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={deactivateDisabled}
            onClick={() => onDeactivate(supplier)}
          >
            {t('common.delete')}
          </Button>
        </div>
      ) : null}
    </article>
  )
}
