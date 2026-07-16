import { cn } from '@/shared/lib/cn'
import type { SelectHTMLAttributes } from 'react'

type SelectOption = {
  value: string
  label: string
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: readonly SelectOption[]
  invalid?: boolean
  placeholder?: string
}

export function Select({
  className,
  options,
  invalid,
  placeholder,
  ...props
}: SelectProps) {
  return (
    <select
      className={cn('input', 'select', invalid && 'input--invalid', className)}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
