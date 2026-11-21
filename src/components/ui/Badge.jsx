import { cn } from '../../lib/cn'

const TONES = {
  neutral: 'bg-surface-muted text-ink-soft',
  primary: 'bg-primary-soft text-[#8a5a00]',
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  olive: 'bg-[#efe9d4] text-olive',
  dark: 'bg-ink text-white',
}

export function Badge({ tone = 'neutral', icon, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-extrabold leading-none',
        TONES[tone] ?? TONES.neutral,
        className,
      )}
    >
      {icon ? (
        <span className="flex items-center" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  )
}
