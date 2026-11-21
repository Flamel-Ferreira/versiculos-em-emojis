import { Check } from 'lucide-react'
import { SEGMENT_COLORS } from '../../config/theme'
import { cn } from '../../lib/cn'

export function ColorPalette({ value, onChange, compact = false }) {
  return (
    <div
      className={cn('flex items-center gap-1.5', compact && 'gap-1')}
      role="radiogroup"
      aria-label="Cor do trecho"
    >
      {SEGMENT_COLORS.map((color) => {
        const selected = color.id === value
        const size = compact ? 'h-7 w-7' : 'h-9 w-9'

        return (
          <button
            key={color.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={color.name}
            title={color.name}
            onClick={() => onChange?.(color.id)}
            className={cn(
              'flex items-center justify-center rounded-full transition hover:scale-105',
              size,
              selected && 'ring-2 ring-offset-2 ring-offset-surface-muted',
            )}
            style={{
              backgroundColor: color.bg,
              '--tw-ring-color': color.ring,
            }}
          >
            {selected ? <Check className="h-4 w-4 text-white drop-shadow" /> : null}
          </button>
        )
      })}
    </div>
  )
}
