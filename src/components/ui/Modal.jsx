import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'

const SIZES = {
  sm: 'max-w-[400px]',
  md: 'max-w-[520px]',
  lg: 'max-w-[680px]',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  size = 'md',
  dismissible = true,
  className,
}) {
  useLockBodyScroll(open)

  useEffect(() => {
    if (!open || !dismissible) return undefined

    function handleKey(event) {
      if (event.key === 'Escape') onClose?.()
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, dismissible, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto bg-[rgba(20,26,46,0.45)] p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && dismissible) onClose?.()
      }}
      role="presentation"
    >
      <div
        className={cn(
          'animate-pop relative my-auto w-full rounded-[1.75rem] border border-border bg-surface p-6 shadow-[var(--shadow-soft-lg)] sm:p-7',
          SIZES[size] ?? SIZES.md,
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Diálogo'}
      >
        {dismissible ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-ink-soft transition hover:bg-surface-strong"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}

        {icon ? (
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            {icon}
          </div>
        ) : null}

        {title ? (
          <h2 className="pr-10 text-2xl font-extrabold tracking-tight text-ink">
            {title}
          </h2>
        ) : null}

        {description ? (
          <p className="mt-2 text-sm font-semibold leading-relaxed text-muted">
            {description}
          </p>
        ) : null}

        {children ? <div className="mt-5">{children}</div> : null}
        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}
