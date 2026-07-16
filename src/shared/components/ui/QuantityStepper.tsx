import { Button } from '@/shared/components/ui/Button'

type QuantityStepperProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  'aria-label'?: string
}

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  'aria-label': ariaLabel = 'Quantity',
}: QuantityStepperProps) {
  const decrease = () => {
    onChange(Math.max(min, Number((value - step).toFixed(2))))
  }

  const increase = () => {
    onChange(Math.min(max, Number((value + step).toFixed(2))))
  }

  return (
    <div className="qty-stepper" aria-label={ariaLabel}>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={decrease}
        disabled={value <= min}
        aria-label="Decrease"
      >
        −
      </Button>
      <span className="qty-stepper__value">{value}</span>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={increase}
        disabled={value >= max}
        aria-label="Increase"
      >
        +
      </Button>
    </div>
  )
}
