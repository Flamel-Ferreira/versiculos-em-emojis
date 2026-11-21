import { cn } from '../../lib/cn'

export function Card({ as: Component = 'div', className, children, ...rest }) {
  return (
    <Component
      className={cn(
        'rounded-[2rem] border border-border bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}
