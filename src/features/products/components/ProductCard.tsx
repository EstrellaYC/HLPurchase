import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import type { ProductWithCategory } from '@/shared/types/database'

type ProductCardProps = {
  product: ProductWithCategory
  canManage: boolean
  onEdit: (product: ProductWithCategory) => void
  onDelete: (product: ProductWithCategory) => void
  deleteDisabled?: boolean
}

export function ProductCard({
  product,
  canManage,
  onEdit,
  onDelete,
  deleteDisabled = false,
}: ProductCardProps) {
  const { t, i18n } = useTranslation()
  const category = product.categories
  const categoryName = category
    ? i18n.language.startsWith('zh')
      ? category.name_zh
      : category.name_en
    : null

  return (
    <article className="list-row">
      <div className="row">
        {product.image_url ? (
          <img
            className="product-thumb"
            src={product.image_url}
            alt={product.name_en || product.name_zh}
          />
        ) : (
          <div className="product-thumb" aria-hidden />
        )}
        <div>
          <div className="list-row__title">
            {product.name_zh} / {product.name_en}
          </div>
          <div className="list-row__meta">
            {[product.sku, categoryName].filter(Boolean).join(' · ') ||
              t('products.category')}
          </div>
          <div className="row" style={{ marginTop: '0.5rem' }}>
            <Badge tone="brand">{product.unit}</Badge>
            {product.min_stock > 0 ? (
              <Badge tone="warning">
                {t('products.minStock')}: {product.min_stock}
              </Badge>
            ) : null}
            {!product.is_active ? (
              <Badge tone="neutral">{t('common.inactive')}</Badge>
            ) : null}
          </div>
        </div>
      </div>

      {canManage ? (
        <div className="row">
          <Button size="sm" variant="secondary" onClick={() => onEdit(product)}>
            {t('common.edit')}
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={deleteDisabled}
            onClick={() => onDelete(product)}
          >
            {t('common.delete')}
          </Button>
        </div>
      ) : null}
    </article>
  )
}
