import { cn } from '../../lib/cn'

export function SegmentedToggle({ options = [], value, onChange, ariaLabel }) {
  return (
    <div
      className="inline-flex w-full rounded-full bg-surface-muted p-1 sm:w-auto ml-auto"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange?.(option.value)}
            aria-pressed={active}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-extrabold transition-all sm:flex-none',
              active
                ? 'bg-primary text-[#3A2B00] shadow-[0_4px_12px_-4px_rgba(201,141,8,0.7)]'
                : 'text-muted hover:text-ink',
            )}
          >
            {option.icon ? (
              <span className="flex items-center" aria-hidden="true">
                {option.icon}
              </span>
            ) : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
