import { cn } from '../../lib/cn'

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  error,
  icon,
  disabled,
  className,
  id,
  ...rest
}) {
  const inputId = id ?? `input-${label?.replace(/\s+/g, '-').toLowerCase() ?? 'field'}`

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
        <input
          id={inputId}
          value={value ?? ''}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            'h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm font-bold text-ink outline-none transition placeholder:font-semibold placeholder:text-muted/80',
            'hover:border-surface-strong focus:border-accent focus:ring-4 focus:ring-accent/10',
            icon && 'pl-11',
            disabled && 'cursor-not-allowed opacity-60',
            error && 'border-danger',
          )}
          {...rest}
        />
      </span>
      {error ? (
        <span className="mt-1.5 block text-xs font-bold text-danger">{error}</span>
      ) : null}
    </label>
  )
}
