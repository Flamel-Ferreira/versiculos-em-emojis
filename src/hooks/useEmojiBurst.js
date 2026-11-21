import { useCallback, useMemo } from 'react'
import confetti from 'canvas-confetti'
import { useReducedMotion } from './useReducedMotion'

let registeredCanvas = null
let canvasInstance = null
const shapeCache = new Map()

export function registerBurstCanvas(element) {
  registeredCanvas = element
  canvasInstance = null
}

function getInstance() {
  if (registeredCanvas) {
    if (!canvasInstance) {
      canvasInstance = confetti.create(registeredCanvas, {
        resize: true,
        useWorker: true,
      })
    }
    return canvasInstance
  }
  return confetti
}

function getShape(emoji) {
  if (!shapeCache.has(emoji)) {
    try {
      shapeCache.set(
        emoji,
        confetti.shapeFromText({ text: emoji, scalar: 3.5 }),
      )
    } catch {
      shapeCache.set(emoji, null)
    }
  }
  return shapeCache.get(emoji)
}

const ORIGINS = [
  { x: 0.5, y: 0.55 },
  { x: 0.2, y: 0.65 },
  { x: 0.8, y: 0.65 },
]

export function useEmojiBurst() {
  const reducedMotion = useReducedMotion()

  const burst = useCallback(
    (emojis = []) => {
      const list = [...new Set(emojis.filter(Boolean))]
      if (list.length === 0) return

      const shapes = list.map(getShape).filter(Boolean)
      if (shapes.length === 0) return

      const fire = getInstance()
      const origins = reducedMotion ? [ORIGINS[0]] : ORIGINS
      const particleCount = reducedMotion ? 18 : 40

      origins.forEach((origin, originIndex) => {
        shapes.forEach((shape, shapeIndex) => {
          fire({
            particleCount,
            spread: 360,
            startVelocity: 45,
            ticks: reducedMotion ? 80 : 400,
            gravity: 0.9,
            scalar: 5,
            decay: 0.92,
            shapes: [shape],
            origin,
            angle: 90,
            drift: originIndex === 1 ? 0.4 : originIndex === 2 ? -0.4 : 0,
            disableForReducedMotion: true,
            zIndex: 60,
            delay: shapeIndex * 30,
          })
        })
      })
    },
    [reducedMotion],
  )

  return useMemo(() => ({ burst }), [burst])
}
