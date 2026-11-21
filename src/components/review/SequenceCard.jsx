import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Check, GripVertical } from 'lucide-react'
import { Emoji } from '../emoji/Emoji'
import { getSegmentColor } from '../../config/theme'
import { cn } from '../../lib/cn'

export function SequenceCard({
  segment,
  variant = 'pool',
  state = null,
  position = null,
  locked = false,
  onClick,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `card-${segment.id}`,
      data: { type: variant, segmentId: segment.id, index: position },
      disabled: locked,
    })

  const color = getSegmentColor(segment.colorId)
  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      onClick={onClick}
      {...listeners}
      {...attributes}
      className={cn(
        'relative flex w-full touch-none select-none items-center gap-2 rounded-2xl border bg-surface p-2.5 text-left shadow-[var(--shadow-soft)] transition',
        variant === 'slot' && 'flex-col gap-1.5 py-3 text-center',
        state === 'correct' && 'border-success/40 bg-success-soft',
        state === 'wrong' && 'animate-shake border-danger/50 bg-danger-soft',
        isDragging && 'z-50 opacity-70',
        !locked && 'hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft-lg)]',
        locked && 'cursor-default',
      )}
    >
      {variant === 'slot' && position != null ? (
        <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-surface-muted text-[10px] font-black text-muted">
          {position + 1}
        </span>
      ) : null}

      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: color.soft, boxShadow: `inset 0 0 0 1px ${color.chip}` }}
      >
        <Emoji char={segment.emoji} size={28} decorative />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-extrabold text-ink">
          {segment.label ?? 'Emoji'}
        </span>
        {variant === 'slot' ? (
          <span className="block text-[10px] font-bold text-muted">
            {locked ? 'Correto!' : 'Toque para retirar'}
          </span>
        ) : null}
      </span>

      {state === 'correct' ? (
        <Check className="h-4 w-4 shrink-0 text-success" />
      ) : (
        <GripVertical className="h-4 w-4 shrink-0 text-muted/50" />
      )}
    </button>
  )
}
