import { getBook } from '../data/bibleBooks'
import { SEGMENT_COLOR_BY_ID } from '../config/theme'
import { formatReference, referenceKey } from './format'
import { normalizeSegments } from './segments'
import { tokenize } from './tokenize'
import { uid } from './uid'

export const REVIEW_MODES = ['organization', 'quiz']

function toPositiveInt(value) {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

export function createVerse({
  bookId,
  chapter,
  verse,
  text,
  segments,
  translation = 'ARA',
}) {
  const book = getBook(bookId)
  const tokens = tokenize(text).tokens
  const now = new Date().toISOString()

  return {
    id: uid(),
    reference: {
      bookId: Number(bookId),
      bookName: book?.name ?? '',
      chapter: Number(chapter),
      verse: Number(verse),
    },
    referenceLabel: formatReference(book?.name ?? '', chapter, verse),
    translation,
    fullText: tokens.join(' '),
    tokens,
    segments: normalizeSegments(segments, tokens).map((segment) => ({
      ...segment,
      id: segment.id ?? uid(),
    })),
    progress: {
      learned: false,
      learnedAt: null,
      reviewModes: [],
      reviewedAt: null,
    },
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Valida e normaliza um versículo vindo do storage ou de um arquivo.
 * Retorna `null` quando a estrutura é irrecuperável.
 */
export function normalizeVerse(raw) {
  if (!raw || typeof raw !== 'object') return null

  const reference = raw.reference ?? {}
  const bookId = toPositiveInt(reference.bookId)
  const chapter = toPositiveInt(reference.chapter)
  const verse = toPositiveInt(reference.verse)

  if (!bookId || !chapter || !verse) return null

  const book = getBook(bookId)
  if (!book) return null

  let tokens = Array.isArray(raw.tokens)
    ? raw.tokens.filter((token) => typeof token === 'string' && token.length > 0)
    : []

  if (tokens.length === 0 && typeof raw.fullText === 'string') {
    tokens = tokenize(raw.fullText).tokens
  }

  if (tokens.length === 0) return null

  const rawSegments = Array.isArray(raw.segments) ? raw.segments : []
  if (rawSegments.length === 0) return null

  const normalizedSegments = normalizeSegments(rawSegments, tokens)
    .map((segment) => {
      const emoji = typeof segment.emoji === 'string' ? segment.emoji.trim() : ''
      if (!emoji) return null

      const colorId = SEGMENT_COLOR_BY_ID[segment.colorId]
        ? segment.colorId
        : 'coral'

      const label =
        typeof segment.label === 'string' && segment.label.trim().length > 0
          ? segment.label.trim().slice(0, 24)
          : null

      return {
        id: typeof segment.id === 'string' && segment.id ? segment.id : uid(),
        startToken: segment.startToken,
        endToken: segment.endToken,
        text: segment.text,
        emoji,
        colorId,
        label,
      }
    })
    .filter(Boolean)

  if (normalizedSegments.length === 0) return null

  // Rótulos são “tudo ou nada” por versículo (invariante 6).
  const hasEveryLabel = normalizedSegments.every((segment) => segment.label)
  const segments = normalizedSegments.map((segment) => ({
    ...segment,
    label: hasEveryLabel ? segment.label : null,
  }))

  const rawProgress = raw.progress ?? {}
  const learned = rawProgress.learned === true
  const reviewModes = learned
    ? REVIEW_MODES.filter(
        (mode) =>
          Array.isArray(rawProgress.reviewModes) &&
          rawProgress.reviewModes.includes(mode),
      )
    : []

  const now = new Date().toISOString()
  const bookName = book.name

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : uid(),
    reference: {
      bookId,
      bookName,
      chapter,
      verse,
    },
    referenceLabel:
      typeof raw.referenceLabel === 'string' && raw.referenceLabel.trim()
        ? raw.referenceLabel.trim()
        : formatReference(bookName, chapter, verse),
    translation:
      typeof raw.translation === 'string' && raw.translation
        ? raw.translation
        : 'ARA',
    fullText: tokens.join(' '),
    tokens,
    segments,
    progress: {
      learned,
      learnedAt: learned ? rawProgress.learnedAt ?? null : null,
      reviewModes,
      reviewedAt: reviewModes.length > 0 ? rawProgress.reviewedAt ?? null : null,
    },
    createdAt:
      typeof raw.createdAt === 'string' && raw.createdAt ? raw.createdAt : now,
    updatedAt:
      typeof raw.updatedAt === 'string' && raw.updatedAt ? raw.updatedAt : now,
  }
}

export function verseReferenceKey(verse) {
  return referenceKey(verse?.reference ?? {})
}

export function isValidVerse(verse) {
  return Boolean(
    verse &&
      Array.isArray(verse.tokens) &&
      verse.tokens.length > 0 &&
      Array.isArray(verse.segments) &&
      verse.segments.length > 0,
  )
}
