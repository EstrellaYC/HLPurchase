export const QUERY_KEYS = {
  auth: {
    session: ['auth', 'session'] as const,
    profile: ['auth', 'profile'] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
  },
  categories: {
    all: ['categories'] as const,
    detail: (id: string) => ['categories', id] as const,
  },
  products: {
    all: ['products'] as const,
    detail: (id: string) => ['products', id] as const,
  },
  suppliers: {
    all: ['suppliers'] as const,
    detail: (id: string) => ['suppliers', id] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    detail: (productId: string) => ['inventory', productId] as const,
    lowStock: ['inventory', 'low-stock'] as const,
  },
  procurementNeeds: {
    all: ['procurement-needs'] as const,
    detail: (id: string) => ['procurement-needs', id] as const,
  },
  purchaseOrders: {
    all: ['purchase-orders'] as const,
    today: ['purchase-orders', 'today'] as const,
    detail: (id: string) => ['purchase-orders', id] as const,
  },
  invoices: {
    all: ['invoices'] as const,
    detail: (id: string) => ['invoices', id] as const,
  },
} as const
