import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

export function QuizOptionCard({
  letter,
  referenceLabel,
  text,
  selected,
  disabled,
  onSelect,
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'flex h-full w-full items-start gap-3 rounded-2xl border-2 bg-surface p-3 text-left transition',
        selected
          ? 'border-accent bg-accent-soft shadow-[0_8px_20px_-14px_rgba(27,79,168,0.9)]'
          : 'border-border hover:border-accent/50 hover:bg-surface-muted/60',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black',
          selected ? 'bg-accent text-white' : 'bg-surface-muted text-ink-soft',
        )}
      >
        {letter}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black text-ink">{referenceLabel}</span>
        <span className="mt-0.5 line-clamp-2 block text-xs font-semibold leading-relaxed text-muted">
          {text}
        </span>
      </span>

      <span
        className={cn(
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
          selected
            ? 'border-accent bg-accent text-white'
            : 'border-surface-strong bg-surface',
        )}
        aria-hidden="true"
      >
        {selected ? <Check className="h-3.5 w-3.5" /> : null}
      </span>
    </button>
  )
}
