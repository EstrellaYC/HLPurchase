import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  useUpdateUserMutation,
  useUsersQuery,
} from '@/features/users/hooks/useUsers'
import {
  updateUserSchema,
  type UpdateUserFormValues,
} from '@/features/users/schemas/user.schema'
import { USER_ROLE_LIST } from '@/shared/constants/roles'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Input } from '@/shared/components/ui/Input'
import { Modal } from '@/shared/components/ui/Modal'
import { Select } from '@/shared/components/ui/Select'
import { Spinner } from '@/shared/components/ui/Spinner'
import { getErrorMessage } from '@/shared/lib/errors'
import type { Profile } from '@/shared/types/database'

type UserEditFormProps = {
  user: Profile
  loading: boolean
  onCancel: () => void
  onSubmit: (values: UpdateUserFormValues) => Promise<void>
}

function getUserFormValues(user: Profile): UpdateUserFormValues {
  return {
    display_name: user.display_name,
    role: user.role,
    is_active: user.is_active,
  }
}

function UserEditForm({ user, loading, onCancel, onSubmit }: UserEditFormProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: getUserFormValues(user),
  })

  useEffect(() => {
    reset(getUserFormValues(user))
  }, [reset, user])

  const roleOptions = USER_ROLE_LIST.map((role) => ({
    value: role,
    label: t(`users.roles.${role}`),
  }))
  const activeOptions = [
    { value: 'true', label: t('common.active') },
    { value: 'false', label: t('common.inactive') },
  ] as const

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="field">
        <label htmlFor="user-display-name">{t('users.displayName')}</label>
        <Input
          id="user-display-name"
          invalid={Boolean(errors.display_name)}
          {...register('display_name')}
        />
        {errors.display_name ? (
          <span className="field-error">{t('common.required')}</span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="user-role">{t('users.role')}</label>
        <Select
          id="user-role"
          options={roleOptions}
          invalid={Boolean(errors.role)}
          {...register('role')}
        />
      </div>

      <div className="field">
        <label htmlFor="user-is-active">{t('common.status')}</label>
        <Select
          id="user-is-active"
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

type UserRowProps = {
  user: Profile
  onEdit: (user: Profile) => void
}

function UserRow({ user, onEdit }: UserRowProps) {
  const { t } = useTranslation()

  return (
    <article className="list-row">
      <div>
        <div className="list-row__title">{user.display_name}</div>
        <div className="list-row__meta">{user.email}</div>
        <div className="row" style={{ marginTop: '0.5rem' }}>
          <Badge tone="brand">{t(`users.roles.${user.role}`)}</Badge>
          <Badge tone={user.is_active ? 'success' : 'neutral'}>
            {user.is_active ? t('common.active') : t('common.inactive')}
          </Badge>
        </div>
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(user)}>
        {t('common.edit')}
      </Button>
    </article>
  )
}

export function UsersPage() {
  const { t } = useTranslation()
  const { isOwner } = useAuth()
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const usersQuery = useUsersQuery({ enabled: isOwner })
  const updateUserMutation = useUpdateUserMutation()

  useEffect(() => {
    if (usersQuery.isError) {
      toast.error(getErrorMessage(usersQuery.error, t('errors.generic')))
    }
  }, [t, usersQuery.error, usersQuery.isError])

  const closeModal = () => {
    setEditingUser(null)
  }

  const handleSubmit = async (values: UpdateUserFormValues) => {
    if (!editingUser) {
      return
    }

    try {
      await updateUserMutation.mutateAsync({
        id: editingUser.id,
        values,
      })
      toast.success(t('users.updated'))
      closeModal()
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.generic')))
    }
  }

  if (!isOwner) {
    return (
      <section className="stack-lg">
        <header className="page-header">
          <h1>{t('users.title')}</h1>
          <p>{t('users.subtitle')}</p>
        </header>
        <EmptyState
          title={t('permissions.managerOnly')}
          description={t('errors.forbidden')}
        />
      </section>
    )
  }

  const users = usersQuery.data ?? []

  return (
    <section className="stack-lg">
      <header className="page-header">
        <h1>{t('users.title')}</h1>
        <p>{t('users.subtitle')}</p>
      </header>

      {usersQuery.isLoading ? <Spinner label={t('common.loading')} /> : null}

      {!usersQuery.isLoading && users.length === 0 ? (
        <EmptyState title={t('common.noResults')} description={t('users.subtitle')} />
      ) : null}

      {users.length > 0 ? (
        <div className="list-panel">
          {users.map((user) => (
            <UserRow key={user.id} user={user} onEdit={setEditingUser} />
          ))}
        </div>
      ) : null}

      {editingUser ? (
        <Modal open={Boolean(editingUser)} title={t('common.edit')} onClose={closeModal}>
          <UserEditForm
            user={editingUser}
            loading={updateUserMutation.isPending}
            onCancel={closeModal}
            onSubmit={handleSubmit}
          />
        </Modal>
      ) : null}
    </section>
  )
}
