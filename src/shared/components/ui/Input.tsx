import { cn } from '@/shared/lib/cn'
import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean
}

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      className={cn('input', invalid && 'input--invalid', className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
}
