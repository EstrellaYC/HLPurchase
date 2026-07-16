import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/schemas/login.schema'
import { signIn } from '@/features/auth/services/auth.service'
import { getErrorMessage } from '@/shared/lib/errors'
import { APP_ROUTES } from '@/shared/constants/routes'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export function LoginForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn(values)
      toast.success(t('auth.submit'))
      navigate(APP_ROUTES.HOME, { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error, t('auth.invalidCredentials')))
    }
  })

  return (
    <form className="form-grid" onSubmit={onSubmit} noValidate>
      {!isSupabaseConfigured ? (
        <p className="muted">{t('home.setupHint')}</p>
      ) : null}

      <div className="field">
        <label htmlFor="email">{t('auth.email')}</label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          invalid={Boolean(errors.email)}
          {...register('email')}
        />
        {errors.email ? (
          <span className="field-error">{t('common.required')}</span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="password">{t('auth.password')}</label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          invalid={Boolean(errors.password)}
          {...register('password')}
        />
        {errors.password ? (
          <span className="field-error">{t('common.required')}</span>
        ) : null}
      </div>

      <Button type="submit" size="lg" loading={isSubmitting}>
        {t('auth.submit')}
      </Button>
    </form>
  )
}
