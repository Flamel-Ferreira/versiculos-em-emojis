import { useCallback } from 'react'
import { useAppData } from '../context/AppDataContext'
import * as sound from '../services/sound'

export function useSound() {
  const { settings } = useAppData()
  const enabled = settings.soundEnabled !== false

  const playSuccess = useCallback(() => {
    if (enabled) sound.playSuccess()
  }, [enabled])

  const playReveal = useCallback(() => {
    if (enabled) sound.playReveal()
  }, [enabled])

  const playError = useCallback(() => {
    if (enabled) sound.playError()
  }, [enabled])

  return { playSuccess, playReveal, playError, enabled }
}
