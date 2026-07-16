import { Input } from '@/shared/components/ui/Input'
import type { ChangeEvent } from 'react'

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  'aria-label'?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  'aria-label': ariaLabel,
}: SearchInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <Input
      type="search"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      aria-label={ariaLabel ?? placeholder}
      autoComplete="off"
      enterKeyHint="search"
    />
  )
}
