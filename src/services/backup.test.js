import { describe, expect, it } from 'vitest'
import { APP_ID } from '../config/theme'
import { importBackup, MAX_FILE_SIZE } from './backup'

const TOKENS = ['O', 'Senhor', 'é', 'o', 'meu', 'pastor;', 'nada', 'me', 'faltará.']

function makeRawVerse({ id = 'v1', verse = 1, tokens = TOKENS } = {}) {
  return {
    id,
    reference: { bookId: 19, bookName: 'Salmos', chapter: 23, verse },
    referenceLabel: `Salmos 23:${verse}`,
    translation: 'ARA',
    fullText: tokens.join(' '),
    tokens,
    segments: [
      {
        id: 's1',
        startToken: 0,
        endToken: 2,
        text: 'O Senhor é',
        emoji: '🐑',
        colorId: 'coral',
        label: 'Pastor',
      },
      {
        id: 's2',
        startToken: 3,
        endToken: 5,
        text: 'o meu pastor;',
        emoji: '💚',
        colorId: 'sky',
        label: 'Cuidado',
      },
      {
        id: 's3',
        startToken: 6,
        endToken: 8,
        text: 'nada me faltará.',
        emoji: '✨',
        colorId: 'amber',
        label: 'Confiança',
      },
    ],
    progress: {
      learned: true,
      learnedAt: '2026-11-20T10:00:00.000Z',
      reviewModes: ['organization', 'quiz'],
      reviewedAt: '2026-11-20T10:10:00.000Z',
    },
    createdAt: '2026-11-20T09:00:00.000Z',
    updatedAt: '2026-11-20T09:00:00.000Z',
  }
}

function makeFile(content, name = 'backup.json') {
  const raw = typeof content === 'string' ? content : JSON.stringify(content)
  return {
    name,
    size: raw.length,
    text: async () => raw,
  }
}

function makePayload(verses) {
  return { app: APP_ID, version: 1, settings: { soundEnabled: true }, verses }
}

describe('importBackup', () => {
  it('rejeita JSON inválido', async () => {
    await expect(importBackup(makeFile('{bad json'))).resolves.toEqual({
      error: 'invalid',
    })
  })

  it('rejeita arquivo de outro aplicativo', async () => {
    const result = await importBackup(
      makeFile({ app: 'outro-app', version: 1, verses: [makeRawVerse()] }),
    )
    expect(result).toEqual({ error: 'invalid' })
  })

  it('rejeita arquivo maior que o limite', async () => {
    const result = await importBackup({
      name: 'grande.json',
      size: MAX_FILE_SIZE + 1,
      text: async () => '{}',
    })
    expect(result).toEqual({ error: 'invalid' })
  })

  it('sinaliza arquivo vazio', async () => {
    await expect(importBackup(makeFile(makePayload([])))).resolves.toEqual({
      error: 'empty',
    })
  })

  it('sinaliza arquivo sem versículos válidos', async () => {
    const result = await importBackup(
      makeFile(makePayload([{ foo: 'bar' }, { reference: {} }])),
    )
    expect(result).toEqual({ error: 'no-valid' })
  })

  it('importa versículos válidos normalizados', async () => {
    const result = await importBackup(makeFile(makePayload([makeRawVerse()])))

    expect(result.error).toBeUndefined()
    expect(result.fileName).toBe('backup.json')
    expect(result.data.ignored).toBe(0)
    expect(result.data.verses).toHaveLength(1)
    expect(result.data.verses[0]).toMatchObject({
      id: 'v1',
      referenceLabel: 'Salmos 23:1',
      progress: {
        learned: true,
        reviewModes: ['organization', 'quiz'],
      },
    })
  })

  it('deduplica referências mantendo a última do arquivo', async () => {
    const first = makeRawVerse({ id: 'antigo' })
    const last = makeRawVerse({ id: 'novo' })

    const result = await importBackup(makeFile(makePayload([first, last])))

    expect(result.data.verses).toHaveLength(1)
    expect(result.data.verses[0].id).toBe('novo')
    expect(result.data.ignored).toBe(1)
  })

  it('ignora entradas inválidas e mantém as válidas', async () => {
    const result = await importBackup(
      makeFile(makePayload([makeRawVerse(), { foo: 'bar' }])),
    )

    expect(result.data.verses).toHaveLength(1)
    expect(result.data.ignored).toBe(1)
  })

  it('rejeita arquivo sem a lista de versículos', async () => {
    const result = await importBackup(
      makeFile({ app: APP_ID, version: 1, verses: 'nope' }),
    )
    expect(result).toEqual({ error: 'invalid' })
  })
})
