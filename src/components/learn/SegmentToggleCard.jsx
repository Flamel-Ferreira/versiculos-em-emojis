import { Eye, EyeOff } from 'lucide-react'
import { Emoji } from '../emoji/Emoji'
import { getSegmentColor } from '../../config/theme'
import { cn } from '../../lib/cn'

export function SegmentToggleCard({ segment, hidden, onToggle }) {
  const color = getSegmentColor(segment.colorId)

  return (
    <button
      type="button"
      onClick={() => onToggle?.(segment)}
      aria-pressed={hidden}
      aria-label={
        hidden
          ? `Revelar trecho ${segment.label ?? segment.emoji}`
          : `Ocultar trecho ${segment.label ?? segment.emoji}`
      }
      className={cn(
        'group flex min-h-[140px] flex-col items-center justify-center gap-2.5 rounded-3xl border bg-surface p-3 text-center shadow-[var(--shadow-soft)] transition',
        'hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft-lg)] active:translate-y-0',
        hidden ? 'border-danger/20' : 'border-border',
      )}
    >
      <span
        className="flex h-16 w-16 items-center justify-center rounded-2xl transition group-hover:scale-105"
        style={{
          backgroundColor: color.soft,
          boxShadow: `inset 0 0 0 2px ${color.chip}`,
        }}
      >
        <Emoji char={segment.emoji} size={40} decorative />
      </span>

      <span className="line-clamp-1 min-h-4 text-xs font-extrabold text-ink-soft">
        {segment.label ?? ''}
      </span>

      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold leading-none',
          hidden
            ? 'bg-danger-soft text-danger'
            : 'bg-accent-soft text-accent',
        )}
      >
        {hidden ? (
          <EyeOff className="h-3 w-3" />
        ) : (
          <Eye className="h-3 w-3" />
        )}
        {hidden ? 'Oculto' : 'Visível'}
      </span>
    </button>
  )
}
