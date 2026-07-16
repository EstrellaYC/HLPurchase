import { cn } from '@/shared/lib/cn'
import type { ReactNode } from 'react'

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'brand'

type BadgeProps = {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}

const toneClass: Record<BadgeTone, string> = {
  neutral: 'badge--neutral',
  success: 'badge--success',
  warning: 'badge--warning',
  danger: 'badge--danger',
  brand: 'badge--brand',
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return <span className={cn('badge', toneClass[tone], className)}>{children}</span>
}
