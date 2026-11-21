import { useEffect, useRef } from 'react'
import { registerBurstCanvas } from '../../hooks/useEmojiBurst'

export function EmojiBurstLayer() {
  const canvasRef = useRef(null)

  useEffect(() => {
    registerBurstCanvas(canvasRef.current)
    return () => registerBurstCanvas(null)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
    />
  )
}
