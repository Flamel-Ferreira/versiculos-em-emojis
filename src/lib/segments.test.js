import { describe, expect, it } from 'vitest'
import {
  getAllowedRange,
  normalizeSegments,
  sortSegments,
  validateSegments,
} from './segments'

const segments = [
  { id: 'a', startToken: 0, endToken: 4 },
  { id: 'b', startToken: 5, endToken: 7 },
  { id: 'c', startToken: 8, endToken: 12 },
]

describe('getAllowedRange', () => {
  it('limita o primeiro trecho ao início do versículo e ao próximo trecho', () => {
    expect(getAllowedRange(segments, 0, 20)).toEqual({ min: 0, max: 4 })
  })

  it('limita trechos do meio entre os vizinhos', () => {
    expect(getAllowedRange(segments, 1, 20)).toEqual({ min: 5, max: 7 })
  })

  it('limita o último trecho ao fim do versículo', () => {
    expect(getAllowedRange(segments, 2, 20)).toEqual({ min: 8, max: 19 })
  })
})

describe('sortSegments', () => {
  it('ordena por startToken sem mutar a lista original', () => {
    const input = [segments[2], segments[0], segments[1]]
    expect(sortSegments(input).map((segment) => segment.id)).toEqual(['a', 'b', 'c'])
    expect(input[0].id).toBe('c')
  })
})

describe('validateSegments', () => {
  const tokens = Array.from({ length: 13 }, (_, index) => `t${index}`)

  it('aceita trechos contíguos e não sobrepostos', () => {
    expect(validateSegments(segments, tokens)).toEqual({ valid: true, errors: [] })
  })

  it('exige pelo menos 3 trechos', () => {
    const result = validateSegments(segments.slice(0, 2), tokens)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Adicione pelo menos 3 trechos.')
  })

  it('rejeita sobreposição', () => {
    const overlapping = [
      { id: 'a', startToken: 0, endToken: 5 },
      { id: 'b', startToken: 5, endToken: 7 },
      { id: 'c', startToken: 8, endToken: 12 },
    ]
    const result = validateSegments(overlapping, tokens)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'Os trechos estão em ordem inválida. Revise as seleções.',
    )
  })

  it('rejeita intervalos fora do versículo', () => {
    const outOfRange = [
      { id: 'a', startToken: 0, endToken: 4 },
      { id: 'b', startToken: 5, endToken: 7 },
      { id: 'c', startToken: 8, endToken: 99 },
    ]
    const result = validateSegments(outOfRange, tokens)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toMatch(/fora do versículo/)
  })
})

describe('normalizeSegments', () => {
  const tokens = ['O', 'Senhor', 'é', 'o', 'meu', 'pastor;', 'nada', 'me', 'faltará.']

  it('ordena, recalcula o texto e descarta intervalos inválidos', () => {
    const result = normalizeSegments(
      [
        { id: 'c', startToken: 7, endToken: 8, text: 'errado' },
        { id: 'a', startToken: 0, endToken: 5, text: 'errado' },
        { id: 'x', startToken: 4, endToken: 6 },
        { id: 'b', startToken: 6, endToken: 6 },
        { id: 'y', startToken: 8, endToken: 99 },
      ],
      tokens,
    )

    expect(result.map((segment) => segment.id)).toEqual(['a', 'b', 'c'])
    expect(result[0].text).toBe('O Senhor é o meu pastor;')
    expect(result[1].text).toBe('nada')
    expect(result[2].text).toBe('me faltará.')
  })
})
