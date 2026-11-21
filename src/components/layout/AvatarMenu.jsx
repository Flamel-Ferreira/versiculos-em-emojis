import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Settings, UserRound } from 'lucide-react'
import { useClickOutside } from '../../hooks/useClickOutside'

export function AvatarMenu() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const close = useCallback(() => setOpen(false), [])

  useClickOutside(containerRef, close, open)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Abrir menu do usuário"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6b5b1e] text-white shadow-[0_6px_16px_-8px_rgba(58,43,0,0.9)] transition hover:bg-[#5a4c18]"
      >
        <UserRound className="h-5 w-5" />
      </button>

      {open ? (
        <div
          role="menu"
          className="animate-pop absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-surface p-2 shadow-[var(--shadow-soft-lg)]"
        >
          <p className="px-3 pb-1 pt-2 text-xs font-extrabold uppercase tracking-wide text-muted">
            Minha conta
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              navigate('/configuracoes')
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-extrabold text-ink transition hover:bg-surface-muted"
          >
            <Settings className="h-4 w-4 text-muted" />
            Configuração
          </button>
        </div>
      ) : null}
    </div>
  )
}
