export function formatReference(bookName, chapter, verse) {
  if (!bookName) return ''
  if (chapter == null) return bookName
  if (verse == null) return `${bookName} ${chapter}`
  return `${bookName} ${chapter}:${verse}`
}

export function truncate(text = '', max = 80) {
  const value = String(text).trim()
  if (value.length <= max) return value
  return `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`
}

export function excerpt(text = '', max = 120) {
  return truncate(text, max)
}

export function formatDate(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural
}

export function referenceKey(reference = {}) {
  return `${reference.bookId}:${reference.chapter}:${reference.verse}`
}

export function verseReferenceKey(verse) {
  return referenceKey(verse?.reference ?? {})
}
