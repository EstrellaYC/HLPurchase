import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  generateSmartSuggestions,
  type SmartSuggestion,
} from '@/features/procurement/smart/smart-procurement.algorithm'
import {
  applySuggestions,
  fetchSmartContext,
} from '@/features/procurement/smart/smart-procurement.service'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Spinner } from '@/shared/components/ui/Spinner'
import { getErrorMessage } from '@/shared/lib/errors'
import { formatMoney, formatQuantity } from '@/shared/utils/format'

export function SmartProcurementPage() {
  const { t, i18n } = useTranslation()
  const { session, canManage } = useAuth()
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [generated, setGenerated] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [applying, setApplying] = useState(false)

  const generate = async () => {
    setGenerating(true)
    try {
      const context = await fetchSmartContext()
      const nextSuggestions = generateSmartSuggestions(context)
      setSuggestions(nextSuggestions)
      setGenerated(true)
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    } finally {
      setGenerating(false)
    }
  }

  const apply = async () => {
    if (!session?.user.id) {
      toast.error(t('errors.unauthorized'))
      return
    }

    setApplying(true)
    try {
      await applySuggestions(suggestions, session.user.id)
      toast.success(t('smartProcurement.created'))
      setSuggestions([])
      setGenerated(false)
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    } finally {
      setApplying(false)
    }
  }

  return (
    <section>
      <header className="page-header">
        <h1>{t('smartProcurement.title')}</h1>
        <p>{t('smartProcurement.subtitle')}</p>
      </header>

      <div className="toolbar">
        <Button type="button" onClick={() => void generate()} loading={generating}>
          {t('smartProcurement.generate')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void apply()}
          loading={applying}
          disabled={!canManage || suggestions.length === 0}
        >
          {t('smartProcurement.apply')}
        </Button>
      </div>

      {!canManage ? <p className="muted">{t('permissions.managerOnly')}</p> : null}
      {generating ? <Spinner label={t('common.loading')} /> : null}

      {suggestions.length > 0 ? (
        <div className="list-panel">
          {suggestions.map((suggestion) => {
            const productName = i18n.language.startsWith('en')
              ? suggestion.product_name_en
              : suggestion.product_name_zh

            return (
              <article
                key={`${suggestion.product_id}-${suggestion.supplier_id}`}
                className="list-row"
              >
                <div className="stack">
                  <div>
                    <h3 className="list-row__title">{productName}</h3>
                    <p className="list-row__meta">
                      {t('inventory.onHand')}:{' '}
                      {formatQuantity(suggestion.current_quantity, suggestion.unit)} ·{' '}
                      {t('products.minStock')}:{' '}
                      {formatQuantity(suggestion.min_stock, suggestion.unit)}
                    </p>
                  </div>
                  <p>
                    {t('smartProcurement.suggestedQty')}:{' '}
                    <strong>
                      {formatQuantity(
                        suggestion.suggested_quantity,
                        suggestion.unit,
                      )}
                    </strong>
                  </p>
                  <p className="list-row__meta">
                    {t('smartProcurement.preferredSupplier')}: {suggestion.supplier.name}
                    {suggestion.is_preferred_supplier ? '' : ` · ${formatMoney(suggestion.unit_price)}`}
                  </p>
                </div>
                <span className="muted">
                  {formatMoney(suggestion.suggested_quantity * suggestion.unit_price)}
                </span>
              </article>
            )
          })}
        </div>
      ) : null}

      {generated && suggestions.length === 0 && !generating ? (
        <EmptyState title={t('smartProcurement.empty')} />
      ) : null}
    </section>
  )
}
