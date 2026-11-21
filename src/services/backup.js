import { APP_ID, SCHEMA_VERSION } from '../config/theme'
import { normalizeVerse } from '../lib/verseSchema'

const MAX_FILE_SIZE = 5 * 1024 * 1024

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function todayStamp() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function exportBackup({ settings, verses }) {
  const payload = {
    app: APP_ID,
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    verses,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const filename = `versiculos-em-emojis-${todayStamp()}.json`

  downloadBlob(blob, filename)
  return filename
}

/**
 * Valida e normaliza um arquivo de backup.
 *
 * @returns {Promise<
 *   { data: { verses: object[], ignored: number }, fileName: string } |
 *   { error: 'invalid' | 'empty' | 'no-valid' }
 * >}
 */
export async function importBackup(file) {
  if (!file || typeof file.text !== 'function') return { error: 'invalid' }
  if (file.size > MAX_FILE_SIZE) return { error: 'invalid' }

  let parsed = null

  try {
    const raw = await file.text()
    parsed = JSON.parse(raw)
  } catch {
    return { error: 'invalid' }
  }

  if (!parsed || typeof parsed !== 'object') return { error: 'invalid' }
  if (parsed.app !== APP_ID) return { error: 'invalid' }

  const version = Number(parsed.version ?? 0)
  if (!Number.isFinite(version) || version > SCHEMA_VERSION) {
    return { error: 'invalid' }
  }

  if (!Array.isArray(parsed.verses)) return { error: 'invalid' }

  if (parsed.verses.length === 0) return { error: 'empty' }

  let ignored = 0
  const byReference = new Map()

  parsed.verses.forEach((rawVerse) => {
    const verse = normalizeVerse(rawVerse)
    if (!verse) {
      ignored += 1
      return
    }

    const key = `${verse.reference.bookId}:${verse.reference.chapter}:${verse.reference.verse}`
    if (byReference.has(key)) ignored += 1
    // A última entrada vence (deduplicação interna do arquivo).
    byReference.set(key, verse)
  })

  const verses = [...byReference.values()]

  if (verses.length === 0) return { error: 'no-valid' }

  return {
    data: { verses, ignored },
    fileName: file.name ?? 'arquivo.json',
  }
}

export { MAX_FILE_SIZE }
