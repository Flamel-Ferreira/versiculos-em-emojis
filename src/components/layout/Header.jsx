import { Link, useLocation } from 'react-router-dom'
import { BookOpenText } from 'lucide-react'
import { cn } from '../../lib/cn'
import { AvatarMenu } from './AvatarMenu'

const NAV_ITEMS = [
  { to: '/', label: 'Início' },
  { to: '/cadastrar', label: 'Cadastrar' },
  { to: '/versiculos', label: 'Versículos' },
]

export function Header() {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-[1200px] items-center gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Versículos em Emojis — Início"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-[#8a5a00]">
            <BookOpenText className="h-6 w-6" />
          </span>
          <span className="hidden leading-[1.05] sm:block">
            <span className="block text-[15px] font-black tracking-tight text-ink">
              Versículos
            </span>
            <span className="block text-[13px] font-extrabold text-muted">
              em Emojis
            </span>
          </span>
        </Link>

        <nav
          className="no-scrollbar mx-auto flex flex-1 justify-center gap-1 overflow-x-auto"
          aria-label="Navegação principal"
        >
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition-colors',
                  active
                    ? 'bg-primary text-[#3A2B00] shadow-[0_4px_12px_-6px_rgba(201,141,8,0.9)]'
                    : 'text-ink-soft hover:bg-surface-muted',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <AvatarMenu />
      </div>
    </header>
  )
}
