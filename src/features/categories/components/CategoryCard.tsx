import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import type { Category } from '@/shared/types/database'

type CategoryCardProps = {
  category: Category
  canManage: boolean
  deleting?: boolean
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryCard({
  category,
  canManage,
  deleting = false,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const { t } = useTranslation()

  return (
    <article className="list-row">
      <div>
        <div className="list-row__title">{category.name_zh}</div>
        <div className="list-row__meta">{category.name_en}</div>
        <div className="row" style={{ marginTop: '0.5rem' }}>
          <Badge tone={category.is_active ? 'success' : 'neutral'}>
            {category.is_active ? t('common.active') : t('common.inactive')}
          </Badge>
          <span className="list-row__meta">{category.sort_order}</span>
        </div>
      </div>

      {canManage ? (
        <div className="row">
          <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(category)}>
            {t('common.edit')}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            loading={deleting}
            onClick={() => onDelete(category)}
          >
            {t('common.delete')}
          </Button>
        </div>
      ) : null}
    </article>
  )
}
