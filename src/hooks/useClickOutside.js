import { useEffect } from 'react'

export function useClickOutside(ref, callback, active = true) {
  useEffect(() => {
    if (!active) return undefined

    function handlePointer(event) {
      const element = ref?.current
      if (!element) return
      if (element.contains(event.target)) return
      callback?.(event)
    }

    function handleKey(event) {
      if (event.key === 'Escape') callback?.(event)
    }

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('touchstart', handlePointer)
    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('touchstart', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [ref, callback, active])
}
