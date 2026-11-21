import { Check, CheckCheck, Circle } from 'lucide-react'
import { cn } from '../../lib/cn'

const BASE =
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold leading-none'

export function VerseStatusTag({ mode, learned, reviewModes = [] }) {
  if (mode === 'review') {
    const count = reviewModes.length

    if (count === 0) {
      return (
        <span className={cn(BASE, 'bg-surface-muted text-muted')}>
          <Circle className="h-3 w-3" />
          Não revisado
        </span>
      )
    }

    return (
      <span className={cn(BASE, 'bg-success-soft text-success')}>
        {count >= 2 ? (
          <CheckCheck className="h-3.5 w-3.5" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        Revisado
      </span>
    )
  }

  return learned ? (
    <span className={cn(BASE, 'bg-success-soft text-success')}>
      <Check className="h-3.5 w-3.5" />
      Aprendido
    </span>
  ) : (
    <span className={cn(BASE, 'bg-surface-muted text-muted')}>
      <Circle className="h-3 w-3" />
      Não aprendido
    </span>
  )
}
