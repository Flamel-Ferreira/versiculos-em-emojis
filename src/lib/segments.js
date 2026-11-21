import { segmentTextFromTokens } from './tokenize'

/**
 * Intervalo de tokens permitido para um trecho, considerando os vizinhos.
 * Ver SPEC 11.4.
 */
export function getAllowedRange(segments, index, total) {
  const prev = segments[index - 1]
  const next = segments[index + 1]

  const min =
    prev && Number.isInteger(prev.endToken) ? prev.endToken + 1 : 0
  const max =
    next && Number.isInteger(next.startToken) ? next.startToken - 1 : total - 1

  return { min, max }
}

export function sortSegments(segments = []) {
  return [...segments].sort((a, b) => a.startToken - b.startToken)
}

export function buildTokenOwnership(segments = [], total = 0) {
  const ownership = new Map()

  segments.forEach((segment) => {
    if (!segment) return
    for (let i = segment.startToken; i <= segment.endToken; i += 1) {
      if (i >= 0 && i < total) ownership.set(i, segment.id)
    }
  })

  return ownership
}

export function validateSegments(segments = [], tokens = []) {
  const errors = []
  const total = tokens.length

  if (!Array.isArray(segments) || segments.length < 3) {
    errors.push('Adicione pelo menos 3 trechos.')
  }

  const ordered = sortSegments(segments)
  let lastEnd = -1

  ordered.forEach((segment, index) => {
    const { startToken, endToken } = segment ?? {}

    if (
      !Number.isInteger(startToken) ||
      !Number.isInteger(endToken) ||
      startToken < 0 ||
      endToken < 0 ||
      startToken >= total ||
      endToken >= total
    ) {
      errors.push(`O trecho ${index + 1} está fora do versículo.`)
      return
    }

    if (startToken > endToken) {
      errors.push(`O trecho ${index + 1} está em ordem inválida.`)
      return
    }

    if (startToken <= lastEnd) {
      errors.push('Os trechos estão em ordem inválida. Revise as seleções.')
      return
    }

    lastEnd = endToken
  })

  return { valid: errors.length === 0, errors }
}

export function rebuildSegmentText(segment, tokens) {
  return {
    ...segment,
    text: segmentTextFromTokens(tokens, segment.startToken, segment.endToken),
  }
}

/**
 * Normaliza trechos vindos de dados persistidos/importados:
 * ordena, recalcula o texto pelos índices e descarta intervalos inválidos.
 */
export function normalizeSegments(segments = [], tokens = []) {
  const total = tokens.length
  const ordered = sortSegments(
    (Array.isArray(segments) ? segments : []).filter((segment) => {
      if (!segment) return false
      const { startToken, endToken } = segment
      return (
        Number.isInteger(startToken) &&
        Number.isInteger(endToken) &&
        startToken >= 0 &&
        endToken >= startToken &&
        endToken < total
      )
    }),
  )

  const result = []
  let lastEnd = -1

  ordered.forEach((segment) => {
    if (segment.startToken <= lastEnd) return
    lastEnd = segment.endToken
    result.push(rebuildSegmentText(segment, tokens))
  })

  return result
}

export function getSegmentById(verse, segmentId) {
  return verse?.segments?.find((segment) => segment.id === segmentId) ?? null
}

export function hasMinimumSegments(verse) {
  return Array.isArray(verse?.segments) && verse.segments.length >= 3
}
