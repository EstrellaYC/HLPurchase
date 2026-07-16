import { BrowserRouter, Link, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { queryClient } from '@/lib/query/client'
import { useAuth, useAuthBootstrap } from '@/features/auth/hooks/useAuth'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { InventoryPage } from '@/features/inventory/pages/InventoryPage'
import { ProcurementNeedsPage } from '@/features/procurement/needs/pages/ProcurementNeedsPage'
import { SmartProcurementPage } from '@/features/procurement/smart/pages/SmartProcurementPage'
import { TodayProcurementPage } from '@/features/procurement/today/pages/TodayProcurementPage'
import { APP_ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/components/ui/Button'
import { Spinner } from '@/shared/components/ui/Spinner'

type TaskLink = {
  to: string
  icon: string
  titleKey: string
  metaKey: string
}

const homeTasks: TaskLink[] = [
  {
    to: APP_ROUTES.INVENTORY,
    icon: 'I',
    titleKey: 'home.countStock',
    metaKey: 'home.countStockMeta',
  },
  {
    to: APP_ROUTES.PROCUREMENT_TODAY,
    icon: 'T',
    titleKey: 'home.todayBuy',
    metaKey: 'home.todayBuyMeta',
  },
  {
    to: APP_ROUTES.PROCUREMENT_NEEDS,
    icon: 'N',
    titleKey: 'home.needs',
    metaKey: 'home.needsMeta',
  },
  {
    to: APP_ROUTES.PROCUREMENT_SMART,
    icon: 'S',
    titleKey: 'home.smart',
    metaKey: 'home.smartMeta',
  },
]

function HomePage() {
  const { t } = useTranslation()

  return (
    <section>
      <header className="page-header">
        <h1>{t('home.title')}</h1>
        <p>{t('home.subtitle')}</p>
      </header>

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

function AppRoutes() {
  useAuthBootstrap()
  const { initialized, isAuthenticated } = useAuth()

  if (!initialized) {
    return <Spinner label="Loading" />
  }

  return (
    <Routes>
      <Route
        path={APP_ROUTES.LOGIN}
        element={
          isAuthenticated ? <Navigate to={APP_ROUTES.HOME} replace /> : <LoginPage />
        }
      />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <AuthenticatedShell />
          ) : (
            <Navigate to={APP_ROUTES.LOGIN} replace />
          )
        }
      />
    </Routes>
  )
}

function AuthenticatedShell() {
  const { t } = useTranslation()
  const { signOut } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <Link to={APP_ROUTES.HOME} className="app-brand">
          {t('app.name')}
        </Link>
        <Button type="button" variant="ghost" size="sm" onClick={() => void signOut()}>
          {t('common.logout')}
        </Button>
      </header>

      <main className="app-main">
        <Routes>
          <Route index element={<HomePage />} />
          <Route path={APP_ROUTES.INVENTORY.slice(1)} element={<InventoryPage />} />
          <Route
            path={APP_ROUTES.PROCUREMENT_NEEDS.slice(1)}
            element={<ProcurementNeedsPage />}
          />
          <Route
            path={APP_ROUTES.PROCUREMENT_TODAY.slice(1)}
            element={<TodayProcurementPage />}
          />
          <Route
            path={APP_ROUTES.PROCUREMENT_SMART.slice(1)}
            element={<SmartProcurementPage />}
          />
          <Route path="*" element={<Navigate to={APP_ROUTES.HOME} replace />} />
        </Routes>
      </main>

      <nav className="app-bottom-nav" aria-label={t('nav.home')}>
        <NavItem to={APP_ROUTES.HOME} label={t('nav.home')} />
        <NavItem to={APP_ROUTES.INVENTORY} label={t('nav.inventory')} />
        <NavItem to={APP_ROUTES.PROCUREMENT_TODAY} label={t('common.today')} />
        <NavItem to={APP_ROUTES.PROCUREMENT_NEEDS} label={t('home.needs')} />
        <NavItem to={APP_ROUTES.PROCUREMENT_SMART} label={t('home.smart')} />
      </nav>
    </div>
  )
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className="nav-item"
      style={({ isActive }) => ({
        color: isActive ? 'var(--color-brand)' : undefined,
        fontWeight: isActive ? 600 : undefined,
      })}
    >
      <span>{label}</span>
    </NavLink>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster richColors position="top-center" />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
