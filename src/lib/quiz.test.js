import { describe, expect, it } from 'vitest'
import { buildQuizOptions, getQuizOptionCount, OPTION_LETTERS } from './quiz'

function makeVerse(index) {
  return {
    id: `verse-${index}`,
    referenceLabel: `Livro ${index}:1`,
    fullText: `Texto do versículo ${index}.`,
  }
}

function makeVerses(total) {
  return Array.from({ length: total }, (_, index) => makeVerse(index + 1))
}

describe('buildQuizOptions', () => {
  it('não gera opções com menos de 3 versículos', () => {
    expect(buildQuizOptions(makeVerse(1), makeVerses(2))).toEqual([])
    expect(buildQuizOptions(null, makeVerses(4))).toEqual([])
  })

  it('gera exatamente 3 opções (A–C) com 3 versículos', () => {
    const verses = makeVerses(3)
    const options = buildQuizOptions(verses[1], verses)

    expect(options).toHaveLength(3)
    expect(options.map((option) => option.letter)).toEqual(['A', 'B', 'C'])
    expect(options.some((option) => option.verseId === verses[1].id)).toBe(true)
    expect(new Set(options.map((option) => option.verseId)).size).toBe(3)
  })

  it('gera exatamente 4 opções (A–D) com 4 ou mais versículos', () => {
    for (const total of [4, 10]) {
      const verses = makeVerses(total)
      const options = buildQuizOptions(verses[0], verses)

      expect(options).toHaveLength(4)
      expect(options.map((option) => option.letter)).toEqual(OPTION_LETTERS)
      expect(options.some((option) => option.verseId === verses[0].id)).toBe(true)
      expect(new Set(options.map((option) => option.verseId)).size).toBe(4)
      // Todos os distratores vêm da lista de versículos cadastrados.
      options.forEach((option) => {
        expect(verses.some((verse) => verse.id === option.verseId)).toBe(true)
      })
    }
  })

  it('embaralha as posições ao longo de várias gerações', () => {
    const verses = makeVerses(6)
    const target = verses[0]
    const orders = new Set()

    for (let attempt = 0; attempt < 25; attempt += 1) {
      orders.add(
        buildQuizOptions(target, verses)
          .map((option) => option.verseId)
          .join('|'),
      )
    }

    expect(orders.size).toBeGreaterThan(1)
  })

  it('copia referência e texto do versículo para a opção', () => {
    const verses = makeVerses(4)
    const options = buildQuizOptions(verses[2], verses)
    const targetOption = options.find((option) => option.verseId === verses[2].id)

    expect(targetOption).toMatchObject({
      referenceLabel: verses[2].referenceLabel,
      text: verses[2].fullText,
    })
  })
})

describe('getQuizOptionCount', () => {
  it('limita a quantidade de opções a 4', () => {
    expect(getQuizOptionCount(0)).toBe(0)
    expect(getQuizOptionCount(3)).toBe(3)
    expect(getQuizOptionCount(4)).toBe(4)
    expect(getQuizOptionCount(12)).toBe(4)
  })
})
