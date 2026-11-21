import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '../../lib/cn'

export function BackButton({ to, label = 'Voltar', className }) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-extrabold text-ink shadow-[var(--shadow-soft)] ring-1 ring-border transition hover:bg-surface-muted',
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  )
}
