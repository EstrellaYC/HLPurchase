import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import {
  categorySchema,
  type CategoryFormValues,
} from '@/features/categories/schemas/category.schema'
import type { Category } from '@/shared/types/database'

type CategoryFormProps = {
  category?: Category | null
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: CategoryFormValues) => Promise<void>
}

function getDefaultValues(category?: Category | null): CategoryFormValues {
  return {
    name_zh: category?.name_zh ?? '',
    name_en: category?.name_en ?? '',
    sort_order: category?.sort_order ?? 0,
    is_active: category?.is_active ?? true,
  }
}

export function CategoryForm({
  category,
  loading = false,
  onCancel,
  onSubmit,
}: CategoryFormProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: getDefaultValues(category),
  })

  useEffect(() => {
    reset(getDefaultValues(category))
  }, [category, reset])

  const activeOptions = [
    { value: 'true', label: t('common.active') },
    { value: 'false', label: t('common.inactive') },
  ] as const

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="field">
        <label htmlFor="category-name-zh">{t('categories.nameZh')}</label>
        <Input
          id="category-name-zh"
          invalid={Boolean(errors.name_zh)}
          {...register('name_zh')}
        />
        {errors.name_zh ? (
          <span className="field-error">{t('common.required')}</span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="category-name-en">{t('categories.nameEn')}</label>
        <Input
          id="category-name-en"
          invalid={Boolean(errors.name_en)}
          {...register('name_en')}
        />
        {errors.name_en ? (
          <span className="field-error">{t('common.required')}</span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="category-sort-order">{t('categories.sortOrder')}</label>
        <Input
          id="category-sort-order"
          type="number"
          min={0}
          step={1}
          invalid={Boolean(errors.sort_order)}
          {...register('sort_order', { valueAsNumber: true })}
        />
        {errors.sort_order ? (
          <span className="field-error">{t('common.required')}</span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="category-is-active">{t('common.status')}</label>
        <Select
          id="category-is-active"
          options={activeOptions}
          invalid={Boolean(errors.is_active)}
          {...register('is_active', {
            setValueAs: (value: unknown) => value === 'true',
          })}
        />
      </div>

      <div className="row-between">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={loading || isSubmitting}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  )
}
