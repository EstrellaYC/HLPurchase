import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { TextArea } from '@/shared/components/ui/TextArea'
import { UploadButton } from '@/shared/components/ui/UploadButton'
import { INVOICE_STATUS } from '@/shared/constants/status'
import { todayISODate } from '@/shared/utils/format'
import { uploadImage } from '@/shared/services/storage.service'
import {
  invoiceSchema,
  type InvoiceFormValues,
} from '@/features/invoices/schemas/invoice.schema'
import type { Supplier } from '@/shared/types/database'

type InvoiceFormProps = {
  suppliers: Supplier[]
  onSubmit: (values: InvoiceFormValues) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

export function InvoiceForm({
  suppliers,
  onSubmit,
  onCancel,
  submitting = false,
}: InvoiceFormProps) {
  const { t } = useTranslation()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      supplier_id: suppliers[0]?.id ?? '',
      invoice_number: '',
      invoice_date: todayISODate(),
      total_amount: 0,
      status: INVOICE_STATUS.PENDING,
      image_url: null,
      note: '',
      items: [{ description: '', quantity: 1, unit_price: 0, product_id: null }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="field">
        <label htmlFor="supplier_id">{t('invoices.supplier')}</label>
        <Select
          id="supplier_id"
          options={suppliers.map((supplier) => ({
            value: supplier.id,
            label: supplier.name,
          }))}
          invalid={Boolean(errors.supplier_id)}
          {...register('supplier_id')}
        />
      </div>

      <div className="field">
        <label htmlFor="invoice_number">{t('invoices.invoiceNumber')}</label>
        <Input id="invoice_number" {...register('invoice_number')} />
      </div>

      <div className="field">
        <label htmlFor="invoice_date">{t('common.date')}</label>
        <Input id="invoice_date" type="date" {...register('invoice_date')} />
      </div>

      <div className="field">
        <label htmlFor="total_amount">{t('invoices.amount')}</label>
        <Input
          id="total_amount"
          type="number"
          step="0.01"
          {...register('total_amount', { valueAsNumber: true })}
        />
      </div>

      <div className="field">
        <label htmlFor="note">{t('common.note')}</label>
        <TextArea id="note" {...register('note')} />
      </div>

      <div className="field">
        <UploadButton
          onUploaded={async (file) => {
            const url = await uploadImage('invoices', file)
            setValue('image_url', url, { shouldDirty: true })
            setImageUrl(url)
          }}
        />
        {imageUrl ? <p className="muted">{imageUrl}</p> : null}
      </div>

      <div className="stack">
        {fields.map((field, index) => (
          <div key={field.id} className="stack" style={{ gap: 8 }}>
            <div className="field">
              <label>{t('invoices.description')}</label>
              <Input {...register(`items.${index}.description`)} />
            </div>
            <div className="row">
              <div className="field" style={{ flex: 1 }}>
                <label>{t('common.quantity')}</label>
                <Input
                  type="number"
                  step="0.01"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>{t('invoices.amount')}</label>
                <Input
                  type="number"
                  step="0.01"
                  {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                />
              </div>
            </div>
            {fields.length > 1 ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                {t('common.delete')}
              </Button>
            ) : null}
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            append({ description: '', quantity: 1, unit_price: 0, product_id: null })
          }
        >
          {t('invoices.addLine')}
        </Button>
      </div>

      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={submitting}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  )
}
