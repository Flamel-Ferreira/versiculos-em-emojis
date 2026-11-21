import { cn } from '../../lib/cn'

export function PageContainer({ children, className, as: Component = 'div' }) {
  return (
    <Component
      className={cn(
        'mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10',
        className,
      )}
    >
      {children}
    </Component>
  )
}
