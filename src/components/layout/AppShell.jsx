import { Header } from './Header'
import { Footer } from './Footer'
import { PageDecorations } from './PageDecorations'
import { ToastViewport } from '../ui/ToastViewport'
import { EmojiBurstLayer } from '../emoji/EmojiBurstLayer'

export function AppShell({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-page">
      <PageDecorations />
      <Header />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
      <ToastViewport />
      <EmojiBurstLayer />
    </div>
  )
}
