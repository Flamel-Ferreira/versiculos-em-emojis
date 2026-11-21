import { useDroppable } from '@dnd-kit/core'
import { RotateCcw } from 'lucide-react'
import { Card } from '../ui/Card'
import { SequenceCard } from './SequenceCard'
import { cn } from '../../lib/cn'
import { truncate } from '../../lib/format'

function EmptySlot({ index }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${index}`,
    data: { type: 'slot', index },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-[92px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-surface-strong bg-surface-strong/40 p-2 text-center transition',
        isOver && 'border-accent bg-accent-soft',
      )}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-xs font-black text-muted">
        {index + 1}º
      </span>
      <span className="text-[11px] font-extrabold text-muted">Emoji</span>
    </div>
  )
}

function FilledSlot({ index, segment, state, locked, onRemove }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${index}`,
    data: { type: 'slot', index },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-2xl transition',
        isOver && 'ring-2 ring-accent ring-offset-2 ring-offset-surface',
      )}
    >
      <SequenceCard
        segment={segment}
        variant="slot"
        state={state}
        position={index}
        locked={locked}
        onClick={() => onRemove?.(index)}
      />
    </div>
  )
}

export function SequenceSlots({
  slots = [],
  segments = [],
  feedback = {},
  locked = new Set(),
  onRemove,
  onReset,
}) {
  const firstSegment = segments[0]

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black tracking-tight text-ink">
          📋 Sua Sequência:
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-2 text-xs font-extrabold text-ink-soft transition hover:bg-surface-strong"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Recomeçar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {slots.map((segmentId, index) => {
          const segment = segmentId
            ? segments.find((item) => item.id === segmentId)
            : null

          if (!segment) {
            return <EmptySlot key={`empty-${index}`} index={index} />
          }

          return (
            <FilledSlot
              key={`slot-${index}`}
              index={index}
              segment={segment}
              state={feedback[segment.id] ?? null}
              locked={locked.has(segment.id)}
              onRemove={onRemove}
            />
          )
        })}
      </div>

      {firstSegment ? (
        <div className="border-t border-dashed border-border pt-3">
          <p className="text-xs font-bold leading-relaxed text-muted">
            💡 Dica: Comece por “{truncate(firstSegment.text, 32)}”
          </p>
        </div>
      ) : null}
    </Card>
  )
}
