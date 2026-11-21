import { BookOpenText } from 'lucide-react'
import { APP_NAME } from '../../config/theme'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-white/70">
      <div className="mx-auto grid w-full max-w-[1200px] gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 md:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-[#8a5a00]">
            <BookOpenText className="h-6 w-6" />
          </span>
          <div className="leading-tight">
            <p className="text-base font-black text-ink">{APP_NAME}</p>
            <p className="text-xs font-bold text-muted">Diversão bíblica infantil</p>
          </div>
        </div>

        <p className="text-sm font-semibold leading-relaxed text-muted md:text-center">
          Aprender a Palavra com alegria e cor para crianças e educadores.
        </p>

        <p className="text-sm font-bold text-muted md:text-right">
          © {year} {APP_NAME}.
        </p>
      </div>
    </footer>
  )
}
