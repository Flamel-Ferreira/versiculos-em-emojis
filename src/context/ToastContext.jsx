import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAppData } from './AppDataContext'

const ToastContext = createContext(null)

const TONE_BY_TYPE = {
  success: 'success',
  error: 'error',
  info: 'info',
  warning: 'warning',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())
  const { storageWarning, clearStorageWarning } = useAppData()

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (message, options = {}) => {
      if (!message) return null

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const toast = {
        id,
        message,
        tone: options.tone ?? TONE_BY_TYPE[options.type] ?? 'info',
        duration: options.duration ?? 4000,
      }

      setToasts((current) => [...current.slice(-3), toast])

      if (toast.duration > 0) {
        const timer = setTimeout(() => dismiss(id), toast.duration)
        timers.current.set(id, timer)
      }

      return id
    },
    [dismiss],
  )

  const toast = useMemo(
    () => ({
      show: showToast,
      success: (message, options) =>
        showToast(message, { ...options, tone: 'success' }),
      error: (message, options) =>
        showToast(message, { ...options, tone: 'error' }),
      info: (message, options) =>
        showToast(message, { ...options, tone: 'info' }),
      warning: (message, options) =>
        showToast(message, { ...options, tone: 'warning' }),
    }),
    [showToast],
  )

  useEffect(() => {
    if (!storageWarning) return
    showToast(storageWarning, { tone: 'warning', duration: 6000 })
    clearStorageWarning()
  }, [storageWarning, showToast, clearStorageWarning])

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer))
      timers.current.clear()
    },
    [],
  )

  const value = useMemo(
    () => ({ toasts, showToast, toast, dismiss }),
    [toasts, showToast, toast, dismiss],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider.')
  }
  return context
}
