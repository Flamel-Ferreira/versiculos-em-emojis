let audioContext = null

function getContext() {
  if (typeof window === 'undefined') return null

  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null

  if (!audioContext) {
    audioContext = new AudioCtx()
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {})
  }

  return audioContext
}

function playTone({ frequency, start = 0, duration = 0.18, gain = 0.12, type = 'sine' }) {
  const ctx = getContext()
  if (!ctx) return

  const now = ctx.currentTime + start
  const oscillator = ctx.createOscillator()
  const volume = ctx.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, now)

  volume.gain.setValueAtTime(0.0001, now)
  volume.gain.exponentialRampToValueAtTime(gain, now + 0.02)
  volume.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  oscillator.connect(volume)
  volume.connect(ctx.destination)

  oscillator.start(now)
  oscillator.stop(now + duration + 0.02)
}

/** Arpejo ascendente de comemoração (C5–E5–G5–C6). */
export function playSuccess() {
  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((frequency, index) => {
      playTone({
        frequency,
        start: index * 0.09,
        duration: 0.22,
        gain: 0.18,
        type: 'triangle',
      })
    })
  } catch {
    // Som é opcional; nunca deve quebrar a UI.
  }
}

/** Nota neutra curta, usada ao revelar trechos. */
export function playReveal() {
  try {
    playTone({ frequency: 659.25, duration: 0.18, gain: 0.1, type: 'sine' })
  } catch {
    // Silencioso por design em caso de falha.
  }
}

/** Duas notas descendentes suaves (feedback de erro). */
export function playError() {
  try {
    playTone({ frequency: 392, duration: 0.16, gain: 0.12, type: 'sine' })
    playTone({
      frequency: 311.13,
      start: 0.14,
      duration: 0.2,
      gain: 0.12,
      type: 'sine',
    })
  } catch {
    // Silencioso por design em caso de falha.
  }
}
