import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { APP_ROUTES } from '@/shared/constants/routes'
import { isSupabaseConfigured } from '@/lib/supabase/client'

const homeTasks = [
  {
    to: APP_ROUTES.INVENTORY,
    icon: '盘',
    titleKey: 'home.countStock',
    metaKey: 'home.countStockMeta',
  },
  {
    to: APP_ROUTES.PROCUREMENT_TODAY,
    icon: '采',
    titleKey: 'home.todayBuy',
    metaKey: 'home.todayBuyMeta',
  },
  {
    to: APP_ROUTES.PROCUREMENT_NEEDS,
    icon: '需',
    titleKey: 'home.needs',
    metaKey: 'home.needsMeta',
  },
  {
    to: APP_ROUTES.PROCUREMENT_SMART,
    icon: '智',
    titleKey: 'home.smart',
    metaKey: 'home.smartMeta',
  },
  {
    to: APP_ROUTES.INVOICES,
    icon: '票',
    titleKey: 'home.invoices',
    metaKey: 'home.invoicesMeta',
  },
] as const

export function HomePage() {
  const { t } = useTranslation()

  return (
    <section>
      <header className="page-header">
        <h1>{t('home.title')}</h1>
        <p>{t('home.subtitle')}</p>
      </header>

      {!isSupabaseConfigured ? (
        <p className="muted" style={{ marginBottom: 16 }}>
          {t('home.setupHint')}
        </p>
      ) : null}

      <div className="task-list">
        {homeTasks.map((task) => (
          <Link key={task.to} to={task.to} className="task-item">
            <span className="task-item__icon">{task.icon}</span>
            <span className="task-item__body">
              <span className="task-item__title">{t(task.titleKey)}</span>
              <span className="task-item__meta">{t(task.metaKey)}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
