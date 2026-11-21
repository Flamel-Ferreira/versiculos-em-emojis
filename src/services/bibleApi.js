import {
  BIBLE_API_BASE,
  BIBLE_TRANSLATION,
  REQUEST_RETRIES,
  REQUEST_TIMEOUT_MS,
} from '../config/bible'
import { cleanVerseText } from '../lib/sanitize'

const chapterCache = new Map()

export class BibleApiError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'BibleApiError'
    this.code = code
  }
}

export function getApiErrorMessage(error) {
  if (!error) return 'Não foi possível carregar o capítulo.'
  if (error.code === 'not-found') return 'Capítulo não encontrado.'
  if (error.code === 'empty') {
    return 'Nenhum versículo encontrado para esta referência.'
  }
  if (error.code === 'timeout') {
    return 'Não foi possível carregar o capítulo. Verifique sua conexão.'
  }
  return 'Não foi possível carregar o capítulo. Verifique sua conexão.'
}

function chapterKey(bookId, chapter) {
  return `${BIBLE_TRANSLATION}/${bookId}/${chapter}`
}

function extractVerses(payload) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.verses)
      ? payload.verses
      : []

  return list
    .map((item) => {
      const verseNumber = Number(item?.verse ?? item?.number ?? item?.v)
      if (!Number.isInteger(verseNumber) || verseNumber <= 0) return null

      const text = cleanVerseText(item?.text ?? item?.verse_text ?? '')
      if (!text) return null

      return { verse: verseNumber, text }
    })
    .filter(Boolean)
}

async function requestJson(url) {
  let lastError = null

  for (let attempt = 0; attempt <= REQUEST_RETRIES; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })

      if (response.status === 404) {
        throw new BibleApiError('not-found', 'Capítulo não encontrado.')
      }

      if (!response.ok) {
        throw new BibleApiError('http', `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof BibleApiError && error.code === 'not-found') {
        throw error
      }

      lastError =
        error?.name === 'AbortError'
          ? new BibleApiError('timeout', 'Tempo esgotado.')
          : new BibleApiError('network', 'Falha de conexão.')
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError ?? new BibleApiError('network', 'Falha de conexão.')
}

/**
 * Lista os versículos de um capítulo (cache em memória por sessão).
 * @returns {Promise<{verse:number,text:string}[]>}
 */
export async function fetchChapter(bookId, chapter) {
  const id = Number(bookId)
  const chapterNumber = Number(chapter)

  if (!id || !chapterNumber) {
    throw new BibleApiError('invalid', 'Referência inválida.')
  }

  const key = chapterKey(id, chapterNumber)
  if (chapterCache.has(key)) return chapterCache.get(key)

  const url = `${BIBLE_API_BASE}/get-text/${BIBLE_TRANSLATION}/${id}/${chapterNumber}/`
  const payload = await requestJson(url)
  const verses = extractVerses(payload)

  if (verses.length === 0) {
    throw new BibleApiError('empty', 'Nenhum versículo encontrado.')
  }

  verses.sort((a, b) => a.verse - b.verse)
  chapterCache.set(key, verses)
  return verses
}

export async function fetchVerse(bookId, chapter, verse) {
  const id = Number(bookId)
  const chapterNumber = Number(chapter)
  const verseNumber = Number(verse)

  if (!id || !chapterNumber || !verseNumber) {
    throw new BibleApiError('invalid', 'Referência inválida.')
  }

  const cached = chapterCache.get(chapterKey(id, chapterNumber))
  if (cached) {
    const found = cached.find((item) => item.verse === verseNumber)
    if (found) return found.text
    throw new BibleApiError('empty', 'Versículo não encontrado.')
  }

  const url = `${BIBLE_API_BASE}/get-verse/${BIBLE_TRANSLATION}/${id}/${chapterNumber}/${verseNumber}/`
  const payload = await requestJson(url)
  const text = cleanVerseText(payload?.text ?? '')

  if (!text) throw new BibleApiError('empty', 'Versículo não encontrado.')
  return text
}

export function clearChapterCache() {
  chapterCache.clear()
}

export { BIBLE_TRANSLATION }
