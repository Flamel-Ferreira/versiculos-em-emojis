import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function PageTopBar({ backTo, backLabel = 'Voltar', title, subtitle }) {
  return (
    <div className="flex flex-col gap-3 rounded-[1.75rem] border border-border bg-surface px-4 py-3 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center">
      <Link
        to={backTo}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-muted px-3 py-2 text-sm font-extrabold text-ink transition hover:bg-surface-strong"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <div className="flex-1 text-center">
        <h1 className="text-lg font-black tracking-tight text-ink sm:text-xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-xs font-bold text-muted">{subtitle}</p>
        ) : null}
      </div>

      <span className="hidden w-[92px] sm:block" aria-hidden="true" />
    </div>
  )
}
