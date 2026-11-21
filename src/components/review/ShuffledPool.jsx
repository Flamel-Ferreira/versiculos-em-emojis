import { useDroppable } from '@dnd-kit/core'
import { Card } from '../ui/Card'
import { SequenceCard } from './SequenceCard'
import { cn } from '../../lib/cn'

export function ShuffledPool({
  items = [],
  segments = [],
  feedback = {},
  onPick,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'pool',
    data: { type: 'pool' },
  })

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-black tracking-tight text-ink">
        🔀 Emojis Embaralhados:
      </h2>

      <div
        ref={setNodeRef}
        className={cn(
          'min-h-[92px] rounded-2xl p-2 transition',
          isOver && 'bg-accent-soft',
        )}
      >
        {items.length === 0 ? (
          <p className="flex min-h-[76px] items-center justify-center text-center text-sm font-semibold text-muted">
            Todos os emojis já estão na sequência.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((segmentId) => {
              const segment = segments.find((item) => item.id === segmentId)
              if (!segment) return null

              return (
                <SequenceCard
                  key={segment.id}
                  segment={segment}
                  variant="pool"
                  state={feedback[segment.id] ?? null}
                  onClick={() => onPick?.(segment.id)}
                />
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
