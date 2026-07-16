import { BrowserRouter, Link, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { queryClient } from '@/lib/query/client'
import { useAuth, useAuthBootstrap } from '@/features/auth/hooks/useAuth'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { MorePage } from '@/features/home/pages/MorePage'
import { UsersPage } from '@/features/users/pages/UsersPage'
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage'
import { ProductsPage } from '@/features/products/pages/ProductsPage'
import { SuppliersPage } from '@/features/suppliers/pages/SuppliersPage'
import { InventoryPage } from '@/features/inventory/pages/InventoryPage'
import { ProcurementNeedsPage } from '@/features/procurement/needs/pages/ProcurementNeedsPage'
import { TodayProcurementPage } from '@/features/procurement/today/pages/TodayProcurementPage'
import { SmartProcurementPage } from '@/features/procurement/smart/pages/SmartProcurementPage'
import { InvoicesPage } from '@/features/invoices/pages/InvoicesPage'
import { ExcelPage } from '@/features/excel/pages/ExcelPage'
import { APP_ROUTES } from '@/shared/constants/routes'
import { Spinner } from '@/shared/components/ui/Spinner'

function AppRoutes() {
  useAuthBootstrap()
  const { initialized, isAuthenticated } = useAuth()

  if (!initialized) {
    return <Spinner />
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

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <Link to={APP_ROUTES.HOME} className="app-brand">
          {t('app.name')}
        </Link>
        <span className="muted" style={{ fontSize: '0.85rem' }}>
          {t('app.tagline')}
        </span>
      </header>

      <main className="app-main">
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="procurement/needs" element={<ProcurementNeedsPage />} />
          <Route path="procurement/today" element={<TodayProcurementPage />} />
          <Route path="procurement/smart" element={<SmartProcurementPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="excel" element={<ExcelPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="more" element={<MorePage />} />
          <Route path="*" element={<Navigate to={APP_ROUTES.HOME} replace />} />
        </Routes>
      </main>

      <nav className="app-bottom-nav" aria-label="Primary">
        <NavItem to={APP_ROUTES.HOME} end label={t('nav.home')} />
        <NavItem to={APP_ROUTES.INVENTORY} label={t('nav.inventory')} />
        <NavItem to={APP_ROUTES.PROCUREMENT_TODAY} label={t('nav.procurement')} />
        <NavItem to={APP_ROUTES.PRODUCTS} label={t('nav.products')} />
        <NavItem to="/more" label={t('nav.more')} />
      </nav>
    </div>
  )
}

function NavItem({
  to,
  label,
  end = false,
}: {
  to: string
  label: string
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}
      data-active="false"
    >
      {({ isActive }) => (
        <span data-active={isActive ? 'true' : 'false'}>{label}</span>
      )}
    </NavLink>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster richColors position="top-center" closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
