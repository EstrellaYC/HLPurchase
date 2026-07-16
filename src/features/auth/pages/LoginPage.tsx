import { useTranslation } from 'react-i18next'
import { LoginForm } from '@/features/auth/components/LoginForm'

export function LoginPage() {
  const { t } = useTranslation()

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>{t('app.name')}</h1>
        <p className="muted" style={{ marginBottom: '1.5rem' }}>
          {t('auth.loginSubtitle')}
        </p>
        <LoginForm />
      </div>
    </div>
  )
}
