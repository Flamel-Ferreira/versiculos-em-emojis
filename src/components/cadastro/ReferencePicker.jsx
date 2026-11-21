import { BookOpen, Hash, ListOrdered } from 'lucide-react'
import { Select } from '../ui/Select'
import { BIBLE_BOOKS, getBook } from '../../data/bibleBooks'

export function ReferencePicker({
  value,
  onChange,
  verseOptions = [],
  loadingVerses = false,
  error,
  disabled = false,
}) {
  const book = getBook(value?.bookId)
  const chapterCount = book?.chapters ?? 0

  const bookOptions = BIBLE_BOOKS.map((item) => ({
    value: String(item.id),
    label: item.name,
  }))

  const chapterOptions = Array.from({ length: chapterCount }, (_, index) => ({
    value: String(index + 1),
    label: `Capítulo ${index + 1}`,
  }))

  const verses = Array.isArray(verseOptions) ? verseOptions : []
  const verseSelectOptions = verses.map((number) => ({
    value: String(number),
    label: `Versículo ${number}`,
  }))

  return (
    <div className="rounded-3xl bg-surface-muted p-4 sm:p-5">
      <p className="mb-3 text-sm font-extrabold text-ink">Referência Bíblica:</p>

      <div className="grid gap-3 md:grid-cols-3">
        <Select
          label="Livro"
          icon={<BookOpen className="h-4 w-4" />}
          placeholder="Escolha o livro"
          value={value?.bookId ? String(value.bookId) : ''}
          disabled={disabled}
          onChange={(next) =>
            onChange?.({
              bookId: next ? Number(next) : '',
              chapter: '',
              verse: '',
            })
          }
          options={bookOptions}
        />

        <Select
          label="Capítulo"
          icon={<Hash className="h-4 w-4" />}
          placeholder={book ? 'Escolha o capítulo' : 'Escolha o livro primeiro'}
          value={value?.chapter ? String(value.chapter) : ''}
          disabled={disabled || !book}
          onChange={(next) =>
            onChange?.({
              bookId: value?.bookId ?? '',
              chapter: next ? Number(next) : '',
              verse: '',
            })
          }
          options={chapterOptions}
        />

        <Select
          label="Versículo"
          icon={<ListOrdered className="h-4 w-4" />}
          placeholder={
            !value?.chapter
              ? 'Escolha o capítulo primeiro'
              : loadingVerses
                ? 'Carregando…'
                : 'Escolha o versículo'
          }
          value={value?.verse ? String(value.verse) : ''}
          disabled={disabled || !value?.chapter || loadingVerses}
          loading={loadingVerses}
          onChange={(next) =>
            onChange?.({
              bookId: value?.bookId ?? '',
              chapter: value?.chapter ?? '',
              verse: next ? Number(next) : '',
            })
          }
          options={verseSelectOptions}
        />
      </div>

      {error ? (
        <p className="mt-3 rounded-2xl bg-danger-soft px-4 py-2 text-sm font-bold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}
