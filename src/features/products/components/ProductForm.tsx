import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { UploadButton } from '@/shared/components/ui/UploadButton'
import { PRODUCT_UNIT_LIST, PRODUCT_UNITS } from '@/shared/constants/status'
import { uploadImage } from '@/shared/services/storage.service'
import {
  productSchema,
  type ProductFormValues,
} from '@/features/products/schemas/product.schema'
import type {
  Category,
  ProductWithCategory,
} from '@/shared/types/database'
import type { ProductUnit } from '@/shared/constants/status'

type ProductFormProps = {
  initialProduct?: ProductWithCategory | null
  categories: readonly Category[]
  onSubmit: (values: ProductFormValues) => void | Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

function isProductUnit(value: string): value is ProductUnit {
  return PRODUCT_UNIT_LIST.includes(value as ProductUnit)
}

function getDefaultUnit(product?: ProductWithCategory | null): ProductUnit {
  if (product && isProductUnit(product.unit)) {
    return product.unit
  }

  return PRODUCT_UNITS.KG
}

export function ProductForm({
  initialProduct,
  categories,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProductFormProps) {
  const { t, i18n } = useTranslation()
  const [isUploading, setIsUploading] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name_zh: initialProduct?.name_zh ?? '',
      name_en: initialProduct?.name_en ?? '',
      sku: initialProduct?.sku ?? '',
      category_id: initialProduct?.category_id ?? null,
      unit: getDefaultUnit(initialProduct),
      min_stock: initialProduct?.min_stock ?? 0,
      is_active: initialProduct?.is_active ?? true,
      image_url: initialProduct?.image_url ?? '',
    },
  })

  const imageUrl = useWatch({ control, name: 'image_url' })
  const disabled = isSubmitting || isFormSubmitting || isUploading
  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  const categoryOptions = [
    { value: '', label: t('common.optional') },
    ...categories.map((category) => ({
      value: category.id,
      label: i18n.language.startsWith('zh')
        ? category.name_zh
        : `${category.name_en} / ${category.name_zh}`,
    })),
  ]
  const unitOptions = PRODUCT_UNIT_LIST.map((unit) => ({
    value: unit,
    label: unit,
  }))

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const uploadedUrl = await uploadImage('products', file)
      setValue('image_url', uploadedUrl, {
        shouldDirty: true,
        shouldValidate: true,
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form className="form-grid" onSubmit={submitHandler} noValidate>
      <div className="field">
        <label htmlFor="product-name-zh">{t('products.nameZh')}</label>
        <Input
          id="product-name-zh"
          invalid={Boolean(errors.name_zh)}
          {...register('name_zh')}
        />
        {errors.name_zh ? (
          <span className="field-error">{t('common.required')}</span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="product-name-en">{t('products.nameEn')}</label>
        <Input
          id="product-name-en"
          invalid={Boolean(errors.name_en)}
          {...register('name_en')}
        />
        {errors.name_en ? (
          <span className="field-error">{t('common.required')}</span>
        ) : null}
      </div>

      <div className="desktop-grid-2">
        <div className="field">
          <label htmlFor="product-sku">{t('products.sku')}</label>
          <Input id="product-sku" {...register('sku')} />
        </div>

        <div className="field">
          <label htmlFor="product-category">{t('products.category')}</label>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <Select
                id="product-category"
                value={field.value ?? ''}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event.target.value || null)
                }}
                options={categoryOptions}
              />
            )}
          />
        </div>
      </div>

      <div className="desktop-grid-2">
        <div className="field">
          <label htmlFor="product-unit">{t('common.unit')}</label>
          <Select
            id="product-unit"
            options={unitOptions}
            invalid={Boolean(errors.unit)}
            {...register('unit')}
          />
        </div>

        <div className="field">
          <label htmlFor="product-min-stock">{t('products.minStock')}</label>
          <Input
            id="product-min-stock"
            type="number"
            min="0"
            step="0.01"
            invalid={Boolean(errors.min_stock)}
            {...register('min_stock', { valueAsNumber: true })}
          />
          {errors.min_stock ? (
            <span className="field-error">{t('common.required')}</span>
          ) : null}
        </div>
      </div>

      <div className="field">
        <label htmlFor="product-image-url">{t('common.uploadImage')}</label>
        {imageUrl ? (
          <img
            className="product-thumb"
            src={imageUrl}
            alt={initialProduct?.name_en ?? t('products.title')}
          />
        ) : null}
        <div className="row">
          <UploadButton
            onUploaded={handleImageUpload}
            loading={isUploading}
            disabled={disabled}
          />
          <Input
            id="product-image-url"
            placeholder="https://"
            {...register('image_url')}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="product-active">{t('common.status')}</label>
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Select
              id="product-active"
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
