import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../lib/cn'

const TONES = {
  success: {
    icon: CheckCircle2,
    className: 'border-success/30 bg-[#123a24] text-white',
    iconClass: 'text-success',
  },
  error: {
    icon: AlertCircle,
    className: 'border-danger/30 bg-[#3d1717] text-white',
    iconClass: 'text-danger',
  },
  warning: {
    icon: AlertCircle,
    className: 'border-primary/40 bg-[#3a2f10] text-white',
    iconClass: 'text-primary',
  },
  info: {
    icon: Info,
    className: 'border-white/10 bg-ink text-white',
    iconClass: 'text-primary',
  },
}

export function ToastViewport() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const tone = TONES[toast.tone] ?? TONES.info
        const Icon = tone.icon

        return (
          <div
            key={toast.id}
            className={cn(
              'animate-slide-up pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-[var(--shadow-soft-lg)]',
              tone.className,
            )}
            role="status"
          >
            <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', tone.iconClass)} />
            <p className="flex-1 text-sm font-bold leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="mt-0.5 rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Fechar aviso"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
