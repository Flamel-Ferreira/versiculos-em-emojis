import { useEffect } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { AppDataProvider } from './context/AppDataContext'
import { ToastProvider } from './context/ToastContext'
import { AppShell } from './components/layout/AppShell'
import { AppRoutes } from './routes'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

export default function App() {
  return (
    <AppDataProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppShell>
            <AppRoutes />
          </AppShell>
        </BrowserRouter>
      </ToastProvider>
    </AppDataProvider>
  )
}
