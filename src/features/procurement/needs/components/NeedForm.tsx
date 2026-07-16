import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { TextArea } from '@/shared/components/ui/TextArea'
import {
  procurementNeedSchema,
  type ProcurementNeedFormInput,
  type ProcurementNeedFormValues,
} from '@/features/procurement/needs/schemas/procurement-need.schema'
import type { NeedProductOption } from '@/features/procurement/needs/services/procurement-need.service'

type NeedFormProps = {
  products: NeedProductOption[]
  onSubmit: (values: ProcurementNeedFormValues) => void | Promise<void>
  submitting?: boolean
}

export function NeedForm({ products, onSubmit, submitting = false }: NeedFormProps) {
  const { t, i18n } = useTranslation()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProcurementNeedFormInput, undefined, ProcurementNeedFormValues>({
    resolver: zodResolver(procurementNeedSchema),
    defaultValues: {
      title: '',
      needed_date: '',
      note: '',
      items: [{ product_id: '', quantity: 1, note: '' }],
    },
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const productOptions = products.map((product) => ({
    value: product.id,
    label: `${
      i18n.language.startsWith('en') ? product.name_en : product.name_zh
    } (${product.unit})`,
  }))

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="field">
        <label htmlFor="need-title">{t('procurementNeeds.titleField')}</label>
        <Input
          id="need-title"
          invalid={Boolean(errors.title)}
          {...register('title')}
        />
        {errors.title ? <span className="field-error">{t('common.required')}</span> : null}
      </div>

      <div className="field">
        <label htmlFor="need-date">{t('procurementNeeds.neededDate')}</label>
        <Input id="need-date" type="date" {...register('needed_date')} />
      </div>

      <div className="field">
        <label htmlFor="need-note">{t('common.note')}</label>
        <TextArea id="need-note" {...register('note')} />
      </div>

      <div className="stack">
        <div className="row-between">
          <h3>{t('common.quantity')}</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ product_id: '', quantity: 1, note: '' })}
          >
            {t('procurementNeeds.addItem')}
          </Button>
        </div>

        {fields.map((field, index) => {
          const itemError = errors.items?.[index]
          return (
            <div key={field.id} className="list-row">
              <div className="form-grid">
                <div className="field">
                  <label htmlFor={`need-item-product-${field.id}`}>
                    {t('products.title')}
                  </label>
                  <Select
                    id={`need-item-product-${field.id}`}
                    options={productOptions}
                    placeholder={t('products.title')}
                    invalid={Boolean(itemError?.product_id)}
                    {...register(`items.${index}.product_id`)}
                  />
                </div>
                <div className="field">
                  <label htmlFor={`need-item-quantity-${field.id}`}>
                    {t('common.quantity')}
                  </label>
                  <Input
                    id={`need-item-quantity-${field.id}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    invalid={Boolean(itemError?.quantity)}
                    {...register(`items.${index}.quantity`)}
                  />
                </div>
                <div className="field">
                  <label htmlFor={`need-item-note-${field.id}`}>{t('common.note')}</label>
                  <Input
                    id={`need-item-note-${field.id}`}
                    {...register(`items.${index}.note`)}
                  />
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                {t('common.delete')}
              </Button>
            </div>
          )
        })}
      </div>

      <Button type="submit" size="lg" loading={submitting}>
        {t('common.save')}
      </Button>
    </form>
  )
}
