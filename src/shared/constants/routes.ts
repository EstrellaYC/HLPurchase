export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  USERS: '/users',
  CATEGORIES: '/categories',
  PRODUCTS: '/products',
  SUPPLIERS: '/suppliers',
  INVENTORY: '/inventory',
  PROCUREMENT_NEEDS: '/procurement/needs',
  PROCUREMENT_TODAY: '/procurement/today',
  PROCUREMENT_SMART: '/procurement/smart',
  INVOICES: '/invoices',
  EXCEL: '/excel',
  SETTINGS: '/settings',
} as const

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES]
