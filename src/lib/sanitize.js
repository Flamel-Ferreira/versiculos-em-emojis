const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
}

export function decodeEntities(text = '') {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code) => {
    const normalized = code.toLowerCase()

    if (normalized.startsWith('#x')) {
      const value = Number.parseInt(normalized.slice(2), 16)
      return Number.isFinite(value) ? String.fromCodePoint(value) : match
    }

    if (normalized.startsWith('#')) {
      const value = Number.parseInt(normalized.slice(1), 10)
      return Number.isFinite(value) ? String.fromCodePoint(value) : match
    }

    return NAMED_ENTITIES[normalized] ?? match
  })
}

/** Remove HTML da API, notas de rodapé e normaliza espaços. */
export function stripHtml(html = '') {
  if (typeof html !== 'string') return ''

  const withoutNotes = html
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li)>/gi, ' ')
    .replace(/<[^>]+>/g, '')

  return decodeEntities(withoutNotes)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** A ARA às vezes envolve a fala inteira em aspas simples. */
export function stripWrappingQuotes(text = '') {
  const trimmed = text.trim()
  const quoteChars = `["'“”‘’]`

  if (trimmed.length < 2) return trimmed

  const starts = new RegExp(`^${quoteChars}`)
  const ends = new RegExp(`${quoteChars}$`)

  if (starts.test(trimmed) && ends.test(trimmed)) {
    return trimmed.slice(1, -1).trim()
  }

  return trimmed
}

export function cleanVerseText(html = '') {
  return stripWrappingQuotes(stripHtml(html))
}
