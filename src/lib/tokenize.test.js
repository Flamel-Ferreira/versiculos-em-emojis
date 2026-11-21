import { describe, expect, it } from 'vitest'
import { segmentTextFromTokens, tokenize } from './tokenize'

describe('tokenize', () => {
  it('divide por espaços preservando a pontuação', () => {
    const { tokens } = tokenize('Porque Deus amou o mundo, de tal maneira.')
    expect(tokens).toEqual(['Porque', 'Deus', 'amou', 'o', 'mundo,', 'de', 'tal', 'maneira.'])
  })

  it('normaliza espaços múltiplos e quebras de linha', () => {
    const { tokens, offsets } = tokenize('  O   Senhor\né   o meu pastor; ')
    expect(tokens).toEqual(['O', 'Senhor', 'é', 'o', 'meu', 'pastor;'])
    expect(offsets[0]).toEqual({ start: 2, end: 3 })
  })

  it('retorna listas vazias para texto vazio', () => {
    expect(tokenize('')).toEqual({ tokens: [], offsets: [] })
    expect(tokenize()).toEqual({ tokens: [], offsets: [] })
  })
})

describe('segmentTextFromTokens', () => {
  const tokens = ['O', 'Senhor', 'é', 'o', 'meu', 'pastor;']

  it('junta o intervalo fechado de tokens', () => {
    expect(segmentTextFromTokens(tokens, 0, 2)).toBe('O Senhor é')
    expect(segmentTextFromTokens(tokens, 3, 5)).toBe('o meu pastor;')
  })

  it('rejeita intervalos inválidos', () => {
    expect(segmentTextFromTokens(tokens, 4, 2)).toBe('')
    expect(segmentTextFromTokens(tokens, 0, 9)).toBe('')
    expect(segmentTextFromTokens(tokens, -1, 2)).toBe('')
    expect(segmentTextFromTokens(null, 0, 1)).toBe('')
  })
})
