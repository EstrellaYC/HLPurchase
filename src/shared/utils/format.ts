export function formatQuantity(value: number, unit?: string): string {
  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(2)
  return unit ? `${rounded} ${unit}` : rounded
}

export function formatMoney(value: number, currency = 'CAD'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10)
}
