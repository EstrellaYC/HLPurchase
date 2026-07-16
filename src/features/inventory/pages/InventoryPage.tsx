import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { INVENTORY_CHANGE_TYPE } from '@/shared/constants/status'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { InventoryCard } from '@/features/inventory/components/InventoryCard'
import { useInventoryQuery, useUpdateStockMutation } from '@/features/inventory/hooks/useInventory'
import { updateInventorySchema } from '@/features/inventory/schemas/inventory.schema'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Input } from '@/shared/components/ui/Input'
import { Modal } from '@/shared/components/ui/Modal'
import { SearchInput } from '@/shared/components/ui/SearchInput'
import { Select } from '@/shared/components/ui/Select'
import { Spinner } from '@/shared/components/ui/Spinner'
import { TextArea } from '@/shared/components/ui/TextArea'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { getErrorMessage } from '@/shared/lib/errors'
import type { InventoryChangeType } from '@/shared/constants/status'
import type { InventoryWithProduct } from '@/shared/types/database'

const changeTypeOptions = [
  INVENTORY_CHANGE_TYPE.COUNT,
  INVENTORY_CHANGE_TYPE.RECEIVE,
  INVENTORY_CHANGE_TYPE.ADJUST,
  INVENTORY_CHANGE_TYPE.WASTE,
].map((value) => ({ value, label: value }))

export function InventoryPage() {
  const { t, i18n } = useTranslation()
  const { session } = useAuth()
  const [search, setSearch] = useState('')
  const [lowOnly, setLowOnly] = useState(false)
  const debouncedSearch = useDebouncedValue(search)
  const inventoryQuery = useInventoryQuery({ search: debouncedSearch, lowOnly })
  const updateStockMutation = useUpdateStockMutation()

  const [selectedItem, setSelectedItem] = useState<InventoryWithProduct | null>(null)
  const [quantity, setQuantity] = useState(0)
  const [changeType, setChangeType] = useState<InventoryChangeType>(
    INVENTORY_CHANGE_TYPE.COUNT,
  )
  const [note, setNote] = useState('')

  const openUpdateModal = (item: InventoryWithProduct) => {
    setSelectedItem(item)
    setQuantity(item.quantity)
    setChangeType(INVENTORY_CHANGE_TYPE.COUNT)
    setNote('')
  }

  const closeUpdateModal = () => {
    setSelectedItem(null)
  }

  const submitUpdate = async () => {
    if (!selectedItem || !session?.user.id) {
      toast.error(t('errors.unauthorized'))
      return
    }

    const parsed = updateInventorySchema.safeParse({
      product_id: selectedItem.product_id,
      quantity,
      change_type: changeType,
      note,
    })

    if (!parsed.success) {
      toast.error(t('common.required'))
      return
    }

    try {
      await updateStockMutation.mutateAsync({
        productId: parsed.data.product_id,
        quantity: parsed.data.quantity,
        changeType: parsed.data.change_type,
        note: parsed.data.note,
        userId: session.user.id,
      })
      toast.success(t('inventory.updated'))
      closeUpdateModal()
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    }
  }

  const selectedName = selectedItem
    ? i18n.language.startsWith('en')
      ? selectedItem.products.name_en
      : selectedItem.products.name_zh
    : ''

  return (
    <section>
      <header className="page-header">
        <div className="row">
          <h1>{t('inventory.title')}</h1>
          {lowOnly ? <Badge tone="warning">{t('inventory.lowStock')}</Badge> : null}
        </div>
        <p>{t('inventory.subtitle')}</p>
      </header>

      <div className="toolbar">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('common.search')}
        />
        <Button
          type="button"
          variant={lowOnly ? 'primary' : 'secondary'}
          onClick={() => setLowOnly((current) => !current)}
        >
          {t('inventory.filterLow')}
        </Button>
      </div>

      {inventoryQuery.isLoading ? <Spinner label={t('common.loading')} /> : null}

      {inventoryQuery.isError ? (
        <EmptyState
          title={t('errors.generic')}
          description={getErrorMessage(inventoryQuery.error)}
          action={
            <Button type="button" onClick={() => void inventoryQuery.refetch()}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : null}

      {inventoryQuery.data && inventoryQuery.data.length > 0 ? (
        <div className="list-panel">
          {inventoryQuery.data.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onEdit={openUpdateModal}
              disabled={updateStockMutation.isPending}
            />
          ))}
        </div>
      ) : null}

      {inventoryQuery.data && inventoryQuery.data.length === 0 ? (
        <EmptyState title={t('inventory.empty')} />
      ) : null}

      <Modal
        open={Boolean(selectedItem)}
        title={t('inventory.update')}
        onClose={closeUpdateModal}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeUpdateModal}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              loading={updateStockMutation.isPending}
              onClick={() => void submitUpdate()}
            >
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="form-grid">
          <p className="list-row__title">{selectedName}</p>
          <div className="field">
            <label htmlFor="stock-change-type">{t('common.status')}</label>
            <Select
              id="stock-change-type"
              options={changeTypeOptions}
              value={changeType}
              onChange={(event) => setChangeType(event.target.value as InventoryChangeType)}
            />
          </div>
          <div className="field">
            <label htmlFor="stock-quantity">{t('common.quantity')}</label>
            <Input
              id="stock-quantity"
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="stock-note">{t('common.note')}</label>
            <TextArea
              id="stock-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>
      </Modal>
    </section>
  )
}
