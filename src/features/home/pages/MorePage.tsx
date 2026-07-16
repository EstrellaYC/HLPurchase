import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { APP_ROUTES } from '@/shared/constants/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Button } from '@/shared/components/ui/Button'
import { setAppLanguage, SUPPORTED_LANGS } from '@/lib/i18n'

const moreLinks = [
  { to: APP_ROUTES.PRODUCTS, titleKey: 'nav.products' },
  { to: APP_ROUTES.CATEGORIES, titleKey: 'more.categories' },
  { to: APP_ROUTES.SUPPLIERS, titleKey: 'more.suppliers' },
  { to: APP_ROUTES.PROCUREMENT_NEEDS, titleKey: 'more.needs' },
  { to: APP_ROUTES.PROCUREMENT_SMART, titleKey: 'more.smart' },
  { to: APP_ROUTES.INVOICES, titleKey: 'more.invoices' },
  { to: APP_ROUTES.EXCEL, titleKey: 'more.excel' },
  { to: APP_ROUTES.USERS, titleKey: 'more.users' },
] as const

export function MorePage() {
  const { t, i18n } = useTranslation()
  const { isOwner, signOut } = useAuth()

  return (
    <section>
      <header className="page-header">
        <h1>{t('more.title')}</h1>
      </header>

      <div className="task-list">
        {moreLinks
          .filter((link) => link.to !== APP_ROUTES.USERS || isOwner)
          .map((link) => (
            <Link key={link.to} to={link.to} className="task-item">
              <span className="task-item__body">
                <span className="task-item__title">{t(link.titleKey)}</span>
              </span>
            </Link>
          ))}
      </div>

      <div className="stack" style={{ marginTop: 24 }}>
        <p className="muted">{t('common.language')}</p>
        <div className="row">
          <Button
            type="button"
            variant={i18n.language === SUPPORTED_LANGS.ZH ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setAppLanguage(SUPPORTED_LANGS.ZH)}
          >
            中文
          </Button>
          <Button
            type="button"
            variant={i18n.language === SUPPORTED_LANGS.EN ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setAppLanguage(SUPPORTED_LANGS.EN)}
          >
            English
          </Button>
        </div>
        <Button type="button" variant="ghost" onClick={() => void signOut()}>
          {t('common.logout')}
        </Button>
      </div>
    </section>
  )
}
