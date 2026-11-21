import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

const VARIANTS = {
  primary:
    'bg-primary text-[#3A2B00] shadow-[0_8px_0_-2px_rgba(201,141,8,0.55)] hover:bg-primary-hover hover:-translate-y-0.5 active:translate-y-1 active:shadow-none',
  accent:
    'bg-accent text-white shadow-[0_8px_0_-2px_rgba(16,55,116,0.45)] hover:bg-accent-hover hover:-translate-y-0.5 active:translate-y-1 active:shadow-none',
  secondary:
    'bg-surface-muted text-ink hover:bg-surface-strong active:translate-y-0.5',
  ghost: 'bg-transparent text-ink-soft hover:bg-surface-muted',
  danger:
    'bg-danger-soft text-danger hover:bg-[#fdd0d0] active:translate-y-0.5',
  success:
    'bg-success-soft text-success hover:bg-[#c9f7d8] active:translate-y-0.5',
  dark: 'bg-ink text-white hover:bg-[#2b3350] active:translate-y-0.5',
}

const SIZES = {
  sm: 'min-h-10 px-4 text-sm gap-2',
  md: 'min-h-12 px-6 text-base gap-3',
  lg: 'min-h-16 px-7 text-lg gap-3',
}

function IconBubble({ children, tone }) {
  if (!children) return null
  return (
    <span
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
        tone === 'dark' ? 'bg-white/15' : 'bg-white/45',
      )}
      aria-hidden="true"
    >
      {children}
    </span>
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  loading = false,
  disabled = false,
  to,
  href,
  onClick,
  type = 'button',
  className,
  children,
  ...rest
}) {
  const isDisabled = disabled || loading
  const classes = cn(
    'inline-flex select-none items-center justify-center rounded-full font-extrabold tracking-tight transition-all duration-150 disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    fullWidth && 'w-full',
    className,
  )

  const content = (
    <>
      <IconBubble tone={variant === 'dark' ? 'dark' : 'light'}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : iconLeft}
      </IconBubble>
      <span className="flex-1 text-center">{children}</span>
      {iconRight ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center" aria-hidden="true">
          {iconRight}
        </span>
      ) : null}
      {!iconRight && (iconLeft || loading) ? <span className="w-9" aria-hidden="true" /> : null}
    </>
  )

  if (to && !isDisabled) {
    return (
      <Link to={to} className={classes} onClick={onClick} {...rest}>
        {content}
      </Link>
    )
  }

  if (href && !isDisabled) {
    return (
      <a href={href} className={classes} onClick={onClick} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      onClick={onClick}
      {...rest}
    >
      {content}
    </button>
  )
}
