import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { TextArea } from '@/shared/components/ui/TextArea'
import {
  supplierSchema,
  type SupplierFormValues,
} from '@/features/suppliers/schemas/supplier.schema'
import type { Supplier } from '@/shared/types/database'

type SupplierFormProps = {
  initialSupplier?: Supplier | null
  onSubmit: (values: SupplierFormValues) => void | Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function SupplierForm({
  initialSupplier,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SupplierFormProps) {
  const { t } = useTranslation()
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: initialSupplier?.name ?? '',
      contact_name: initialSupplier?.contact_name ?? '',
      phone: initialSupplier?.phone ?? '',
      email: initialSupplier?.email ?? '',
      wechat: initialSupplier?.wechat ?? '',
      notes: initialSupplier?.notes ?? '',
      is_active: initialSupplier?.is_active ?? true,
    },
  })

  const disabled = isSubmitting || isFormSubmitting
  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <form className="form-grid" onSubmit={submitHandler} noValidate>
      <div className="field">
        <label htmlFor="supplier-name">{t('suppliers.name')}</label>
        <Input
          id="supplier-name"
          invalid={Boolean(errors.name)}
          {...register('name')}
        />
        {errors.name ? (
          <span className="field-error">{t('common.required')}</span>
        ) : null}
      </div>

      <div className="desktop-grid-2">
        <div className="field">
          <label htmlFor="supplier-contact-name">
            {t('suppliers.contactName')}
          </label>
          <Input id="supplier-contact-name" {...register('contact_name')} />
        </div>

        <div className="field">
          <label htmlFor="supplier-phone">{t('suppliers.phone')}</label>
          <Input id="supplier-phone" type="tel" {...register('phone')} />
        </div>
      </div>

      <div className="desktop-grid-2">
        <div className="field">
          <label htmlFor="supplier-email">{t('suppliers.email')}</label>
          <Input
            id="supplier-email"
            type="email"
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email ? (
            <span className="field-error">{t('suppliers.email')}</span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="supplier-wechat">{t('suppliers.wechat')}</label>
          <Input id="supplier-wechat" {...register('wechat')} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="supplier-notes">{t('suppliers.notes')}</label>
        <TextArea id="supplier-notes" {...register('notes')} />
      </div>

      <div className="field">
        <label htmlFor="supplier-active">{t('common.status')}</label>
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Select
              id="supplier-active"
              value={field.value ? 'true' : 'false'}
              onBlur={field.onBlur}
              onChange={(event) => {
                field.onChange(event.target.value === 'true')
              }}
              options={[
                { value: 'true', label: t('common.active') },
                { value: 'false', label: t('common.inactive') },
              ]}
            />
          )}
        />
      </div>

      <div className="row-between">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={disabled}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  )
}
