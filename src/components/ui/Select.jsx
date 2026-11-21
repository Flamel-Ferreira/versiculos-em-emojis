import { ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Select({
  label,
  icon,
  value,
  onChange,
  options = [],
  placeholder = 'Selecione',
  disabled = false,
  loading = false,
  error,
  className,
  id,
}) {
  const inputId = id ?? `select-${label?.replace(/\s+/g, '-').toLowerCase() ?? 'field'}`

  return (
    <label className={cn('block', className)} htmlFor={inputId}>
      {label ? (
        <span className="mb-1.5 block text-sm font-extrabold text-ink">
          {label}
        </span>
      ) : null}
      <span className="relative block">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center text-muted">
            {icon}
          </span>
        ) : null}
        <select
          id={inputId}
          value={value ?? ''}
          disabled={disabled || loading}
          onChange={(event) => onChange?.(event.target.value)}
          className={cn(
            'h-14 w-full appearance-none rounded-2xl border bg-surface px-4 text-base font-bold text-ink outline-none transition',
            'border-border hover:border-surface-strong focus:border-accent focus:ring-4 focus:ring-accent/10',
            icon && 'pl-11',
            'pr-10',
            (disabled || loading) && 'cursor-not-allowed opacity-60',
            error && 'border-danger',
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 items-center text-muted">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </span>
      {error ? (
        <span className="mt-1.5 block text-xs font-bold text-danger">{error}</span>
      ) : null}
    </label>
  )
}
