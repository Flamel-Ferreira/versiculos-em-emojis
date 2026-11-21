/** Fisher-Yates. Retorna uma nova lista embaralhada. */
export function shuffle(input = []) {
  const arr = [...input]

  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  return arr
}

function isSameOrder(a, b) {
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

/**
 * Embaralha garantindo que o resultado não seja igual à ordem correta.
 * Para listas de 0 ou 1 item não há o que fazer.
 */
export function shuffleNotSolved(ids = []) {
  const original = [...ids]

  if (original.length <= 1) return original

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = shuffle(original)
    if (!isSameOrder(candidate, original)) return candidate
  }

  // Fallback determinístico: rotaciona uma posição.
  return [...original.slice(1), original[0]]
}

export function pickRandom(input = [], count = 1) {
  return shuffle(input).slice(0, Math.max(0, count))
}
