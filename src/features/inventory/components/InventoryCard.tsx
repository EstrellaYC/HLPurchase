import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { QuantityStepper } from '@/shared/components/ui/QuantityStepper'
import { formatQuantity } from '@/shared/utils/format'
import type { InventoryWithProduct } from '@/shared/types/database'

type InventoryCardProps = {
  item: InventoryWithProduct
  onEdit?: (item: InventoryWithProduct) => void
  onQuantityChange?: (item: InventoryWithProduct, quantity: number) => void
  disabled?: boolean
}

function useLocalizedProductName(item: InventoryWithProduct): string {
  const { i18n } = useTranslation()
  return i18n.language.startsWith('en')
    ? item.products.name_en
    : item.products.name_zh
}

export function InventoryCard({
  item,
  onEdit,
  onQuantityChange,
  disabled = false,
}: InventoryCardProps) {
  const { t, i18n } = useTranslation()
  const productName = useLocalizedProductName(item)
  const category = item.products.categories
  const categoryName = category
    ? i18n.language.startsWith('en')
      ? category.name_en
      : category.name_zh
    : null
  const isLow = item.quantity < item.products.min_stock

  return (
    <article className="list-row">
      <div>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          {item.products.image_url ? (
            <img
              className="product-thumb"
              src={item.products.image_url}
              alt=""
              loading="lazy"
            />
          ) : null}
          <div>
            <div className="row">
              <h3 className="list-row__title">{productName}</h3>
              {isLow ? <Badge tone="warning">{t('inventory.lowStock')}</Badge> : null}
            </div>
            <p className="list-row__meta">
              {categoryName ? `${categoryName} · ` : ''}
              {t('inventory.onHand')}: {formatQuantity(item.quantity, item.products.unit)}
            </p>
            <p className="list-row__meta">
              {t('products.minStock')}: {formatQuantity(item.products.min_stock, item.products.unit)}
            </p>
          </div>
        </div>
      </div>

      {onQuantityChange ? (
        <QuantityStepper
          value={item.quantity}
          onChange={(quantity) => onQuantityChange(item, quantity)}
          aria-label={`${t('common.quantity')} ${productName}`}
        />
      ) : (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onEdit?.(item)}
          disabled={disabled || !onEdit}
        >
          {t('common.edit')}
        </Button>
      )}
    </article>
  )
}
