export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="spinner" role="status" aria-live="polite">
      <span className="spinner__dot" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  )
}
