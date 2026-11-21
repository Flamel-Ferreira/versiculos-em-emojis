import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useClickOutside } from '../../hooks/useClickOutside'

/**
 * Popover posicionado em relação a um elemento âncora.
 * Fecha com Esc e clique fora.
 */
export function Popover({
  open,
  onClose,
  anchorRef,
  align = 'start',
  width = 360,
  children,
}) {
  const panelRef = useRef(null)
  const [style, setStyle] = useState({ top: 0, left: 0 })

  useClickOutside(
    panelRef,
    (event) => {
      if (anchorRef?.current?.contains(event.target)) return
      onClose?.()
    },
    open,
  )

  useEffect(() => {
    if (!open) return undefined
    function handleKey(event) {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useLayoutEffect(() => {
    if (!open) return undefined

    function update() {
      const anchor = anchorRef?.current
      if (!anchor) return

      const rect = anchor.getBoundingClientRect()
      const panelWidth = Math.min(width, window.innerWidth - 24)
      let left = align === 'end' ? rect.right - panelWidth : rect.left
      left = Math.max(12, Math.min(left, window.innerWidth - panelWidth - 12))

      let top = rect.bottom + 8
      const estimatedHeight = 420
      if (top + estimatedHeight > window.innerHeight && rect.top > estimatedHeight) {
        top = Math.max(12, rect.top - estimatedHeight - 8)
      }

      setStyle({ top, left, width: panelWidth })
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, anchorRef, align, width])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={panelRef}
      className="animate-pop fixed z-[80] rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow-soft-lg)]"
      style={style}
      role="dialog"
    >
      {children}
    </div>,
    document.body,
  )
}
