import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Spinner({ size = 24, label, className }) {
  return (
    <span
      className={cn('inline-flex items-center gap-2 text-muted', className)}
      role="status"
    >
      <Loader2 className="animate-spin" style={{ width: size, height: size }} />
      {label ? <span className="text-sm font-bold">{label}</span> : null}
      <span className="sr-only">{label ?? 'Carregando'}</span>
    </span>
  )
}
