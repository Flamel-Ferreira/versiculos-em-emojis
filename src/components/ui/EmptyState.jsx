import { cn } from '../../lib/cn'

export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-dashed border-border bg-surface/70 px-6 py-14 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
          {icon}
        </div>
      ) : null}
      <div className="space-y-2">
        <h3 className="text-xl font-extrabold text-ink">{title}</h3>
        {description ? (
          <p className="mx-auto max-w-md text-sm font-semibold leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
