import {
  APP_ID,
  DEFAULT_SETTINGS,
  SCHEMA_VERSION,
  STORAGE_KEY,
} from '../config/theme'
import { normalizeVerse } from '../lib/verseSchema'

let lastLoadWarning = null

export function createInitialData() {
  return {
    app: APP_ID,
    version: SCHEMA_VERSION,
    settings: { ...DEFAULT_SETTINGS },
    verses: [],
  }
}

export function isStorageAvailable() {
  try {
    const key = '__vee_probe__'
    window.localStorage.setItem(key, '1')
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function getLastLoadWarning() {
  return lastLoadWarning
}

/**
 * Carrega o estado persistido. Nunca lança: em caso de falha retorna o
 * estado inicial e registra um aviso para o toast.
 */
export function loadData() {
  lastLoadWarning = null

  if (typeof window === 'undefined') return createInitialData()

  let raw = null

  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    lastLoadWarning = 'Os dados não serão salvos neste navegador.'
    return createInitialData()
  }

  if (!raw) return createInitialData()

  try {
    const parsed = JSON.parse(raw)

    if (!parsed || typeof parsed !== 'object') {
      lastLoadWarning = 'Não foi possível carregar os dados salvos.'
      return createInitialData()
    }

    if (parsed.app && parsed.app !== APP_ID) {
      lastLoadWarning = 'Não foi possível carregar os dados salvos.'
      return createInitialData()
    }

    const version = Number(parsed.version ?? SCHEMA_VERSION)
    if (!Number.isFinite(version) || version > SCHEMA_VERSION) {
      lastLoadWarning = 'Não foi possível carregar os dados salvos.'
      return createInitialData()
    }

    const settings = {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings && typeof parsed.settings === 'object'
        ? {
            translation:
              typeof parsed.settings.translation === 'string'
                ? parsed.settings.translation
                : DEFAULT_SETTINGS.translation,
            soundEnabled: parsed.settings.soundEnabled !== false,
          }
        : {}),
    }

    const seen = new Set()
    const verses = (Array.isArray(parsed.verses) ? parsed.verses : [])
      .map(normalizeVerse)
      .filter((verse) => {
        if (!verse) return false
        const key = `${verse.reference.bookId}:${verse.reference.chapter}:${verse.reference.verse}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

    return {
      app: APP_ID,
      version: SCHEMA_VERSION,
      settings,
      verses,
    }
  } catch {
    lastLoadWarning = 'Não foi possível carregar os dados salvos.'
    return createInitialData()
  }
}

export function saveData(data) {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        app: APP_ID,
        version: SCHEMA_VERSION,
        settings: data.settings,
        verses: data.verses,
      }),
    )
    return true
  } catch {
    return false
  }
}

export function resetData() {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.removeItem(STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

export { STORAGE_KEY }
