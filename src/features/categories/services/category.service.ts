import { supabase } from '@/lib/supabase/client'
import { AppError } from '@/shared/lib/errors'
import type { Category } from '@/shared/types/database'

export type CategoryInput = {
  name_zh: string
  name_en: string
  sort_order: number
  is_active: boolean
}

export type UpdateCategoryInput = Partial<CategoryInput>

function toCategoryServiceError(error: unknown, fallback: string, code: string): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error && error.message) {
    return new AppError(error.message, code)
  }

  return new AppError(fallback, code)
}

export async function listCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name_zh', { ascending: true })

    if (error) {
      throw new AppError(error.message, 'CATEGORIES_LIST_FAILED')
    }

    return (data ?? []) as Category[]
  } catch (error) {
    throw toCategoryServiceError(
      error,
      'Failed to load categories',
      'CATEGORIES_LIST_FAILED',
    )
  }
}

export async function createCategory(values: CategoryInput): Promise<Category> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert(values)
      .select('*')
      .single()

    if (error || !data) {
      throw new AppError(error?.message ?? 'Category not created', 'CATEGORY_CREATE_FAILED')
    }

    return data as Category
  } catch (error) {
    throw toCategoryServiceError(
      error,
      'Failed to create category',
      'CATEGORY_CREATE_FAILED',
    )
  }
}

export async function updateCategory(
  id: string,
  values: UpdateCategoryInput,
): Promise<Category> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(values)
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) {
      throw new AppError(error?.message ?? 'Category not found', 'CATEGORY_UPDATE_FAILED')
    }

    return data as Category
  } catch (error) {
    throw toCategoryServiceError(
      error,
      'Failed to update category',
      'CATEGORY_UPDATE_FAILED',
    )
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      throw new AppError(error.message, 'CATEGORY_DELETE_FAILED')
    }
  } catch (error) {
    throw toCategoryServiceError(
      error,
      'Failed to delete category',
      'CATEGORY_DELETE_FAILED',
    )
  }
}
