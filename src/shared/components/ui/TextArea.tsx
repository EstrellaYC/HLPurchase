import { cn } from '@/shared/lib/cn'
import type { TextareaHTMLAttributes } from 'react'

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean
}

export function TextArea({ className, invalid, ...props }: TextAreaProps) {
  return (
    <textarea
      className={cn('input', 'textarea', invalid && 'input--invalid', className)}
      aria-invalid={invalid || undefined}
      rows={props.rows ?? 3}
      {...props}
    />
  )
}
