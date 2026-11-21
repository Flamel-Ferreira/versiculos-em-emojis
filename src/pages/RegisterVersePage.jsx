import { useMemo, useState } from 'react'
import { AlertCircle, BookOpen, CheckCircle2, RotateCcw } from 'lucide-react'
import { PageContainer } from '../components/layout/PageContainer'
import { BackButton } from '../components/layout/BackButton'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ReferencePicker } from '../components/cadastro/ReferencePicker'
import { SegmentList } from '../components/cadastro/SegmentList'
import { DuplicateVerseModal } from '../components/cadastro/DuplicateVerseModal'
import { RegisterSuccessModal } from '../components/cadastro/RegisterSuccessModal'
import { useAppData } from '../context/AppDataContext'
import { useToast } from '../context/ToastContext'
import { useBibleChapter } from '../hooks/useBibleChapter'
import { useBibleVerse } from '../hooks/useBibleVerse'
import { getBook } from '../data/bibleBooks'
import { nextSegmentColor } from '../config/theme'
import { formatReference } from '../lib/format'
import { validateSegments } from '../lib/segments'
import { createVerse } from '../lib/verseSchema'
import { uid } from '../lib/uid'

const EMPTY_REFERENCE = { bookId: '', chapter: '', verse: '' }

export function RegisterVersePage() {
  const { addVerse, hasReference } = useAppData()
  const { toast } = useToast()

  const [reference, setReference] = useState(EMPTY_REFERENCE)
  const [segments, setSegments] = useState([])
  const [pendingReference, setPendingReference] = useState(null)
  const [errors, setErrors] = useState([])
  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [savedVerse, setSavedVerse] = useState(null)

  const {
    verses: chapterVerses,
    loading: loadingChapter,
    error: chapterError,
    retry: retryChapter,
  } = useBibleChapter(reference.bookId, reference.chapter)

  const {
    text: verseText,
    tokens,
    loading: loadingVerse,
    error: verseError,
    retry: retryVerse,
  } = useBibleVerse(reference.bookId, reference.chapter, reference.verse)

  const verseOptions = useMemo(
    () => chapterVerses.map((item) => item.verse),
    [chapterVerses],
  )

  const hasCompleteReference = Boolean(
    reference.bookId && reference.chapter && reference.verse,
  )

  const referenceLabel = hasCompleteReference
    ? formatReference(
        getBook(reference.bookId)?.name ?? '',
        reference.chapter,
        reference.verse,
      )
    : ''

  const lastSegment = segments[segments.length - 1]
  const canAdd =
    hasCompleteReference &&
    tokens.length > 0 &&
    !loadingVerse &&
    (!lastSegment || Boolean(lastSegment.text))

  const addHint = !hasCompleteReference
    ? 'Escolha livro, capítulo e versículo primeiro.'
    : loadingVerse
      ? 'Aguarde o carregamento do versículo.'
      : tokens.length === 0
        ? 'Carregue o texto do versículo para começar.'
        : lastSegment && !lastSegment.text
          ? 'Aplique o texto do trecho anterior antes de adicionar outro.'
          : ''

  const canSubmit =
    hasCompleteReference &&
    tokens.length > 0 &&
    segments.length >= 3 &&
    segments.every((segment) => segment.text && segment.emoji && segment.colorId)

  function applyReference(next) {
    setReference(next)
    setSegments([])
    setErrors([])
  }

  function requestReference(next) {
    if (segments.length > 0) {
      setPendingReference(next)
      return
    }
    applyReference(next)
  }

  function addSegment() {
    if (!canAdd) return
    const color = nextSegmentColor(segments.length)

    setSegments((current) => [
      ...current,
      {
        localId: uid(),
        startToken: null,
        endToken: null,
        text: '',
        emoji: '',
        colorId: color.id,
        label: null,
      },
    ])
    setErrors([])
  }

  function updateSegment(localId, patch) {
    setSegments((current) =>
      current.map((segment) =>
        segment.localId === localId ? { ...segment, ...patch } : segment,
      ),
    )
    setErrors([])
  }

  function removeSegment(localId) {
    setSegments((current) =>
      current.filter((segment) => segment.localId !== localId),
    )
    setErrors([])
  }

  function validateForm() {
    const nextErrors = []

    if (!hasCompleteReference) {
      nextErrors.push('Selecione livro, capítulo e versículo.')
    }

    if (segments.length < 3) {
      nextErrors.push('Adicione pelo menos 3 trechos.')
    }

    segments.forEach((segment, index) => {
      if (!segment.text) nextErrors.push(`O trecho ${index + 1} está sem texto.`)
      if (!segment.emoji) {
        nextErrors.push(`Escolha um emoji para o trecho ${index + 1}.`)
      }
      if (!segment.colorId) {
        nextErrors.push(`Escolha uma cor para o trecho ${index + 1}.`)
      }
    })

    const labels = segments.filter((segment) => segment.label).length
    if (labels > 0 && labels < segments.length) {
      nextErrors.push('Preencha o rótulo de todos os trechos ou remova todos.')
    }

    const { valid } = validateSegments(segments, tokens)
    if (!valid) {
      nextErrors.push('Os trechos estão em ordem inválida. Revise as seleções.')
    }

    return nextErrors
  }

  function handleSubmit() {
    const nextErrors = validateForm()

    if (nextErrors.length > 0) {
      setErrors(nextErrors)
      toast.error('Revise os campos destacados antes de cadastrar.')
      return
    }

    if (hasReference(reference)) {
      setDuplicateOpen(true)
      return
    }

    const verse = createVerse({
      bookId: reference.bookId,
      chapter: reference.chapter,
      verse: reference.verse,
      text: verseText,
      segments: segments.map((segment) => ({
        ...segment,
        id: segment.localId,
      })),
    })

    addVerse(verse)
    setSavedVerse(verse)
    setSuccessOpen(true)
    setErrors([])
  }

  function resetForm() {
    setReference(EMPTY_REFERENCE)
    setSegments([])
    setErrors([])
  }

  return (
    <PageContainer className="max-w-[1000px] space-y-5">
      <BackButton to="/" label="Voltar ao Menu" />

      <Card className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">
            ✏️ Cadastro de Versículo
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-muted">
            Divida o versículo em trechos fáceis e conecte cada parte ao seu emoji
            ilustrativo!
          </p>
        </div>

        <ReferencePicker
          value={reference}
          onChange={requestReference}
          verseOptions={verseOptions}
          loadingVerses={loadingChapter}
        />

        {chapterError ? (
          <div className="flex flex-col gap-2 rounded-2xl bg-danger-soft px-4 py-3 text-sm font-bold text-danger sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Não foi possível carregar o capítulo. Verifique sua conexão.
            </span>
            <button
              type="button"
              onClick={retryChapter}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-extrabold text-danger"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Tentar novamente
            </button>
          </div>
        ) : null}

        {loadingVerse ? (
          <div className="flex items-center justify-center rounded-2xl bg-surface-muted py-6">
            <Spinner label="Carregando versículo…" />
          </div>
        ) : null}

        {verseError ? (
          <div className="flex flex-col gap-2 rounded-2xl bg-danger-soft px-4 py-3 text-sm font-bold text-danger sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {verseError}
            </span>
            <button
              type="button"
              onClick={retryVerse}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-extrabold text-danger"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Tentar novamente
            </button>
          </div>
        ) : null}

        {verseText && !loadingVerse ? (
          <div className="rounded-2xl border border-border bg-surface-muted/60 px-4 py-3">
            <p className="mb-1 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-muted">
              <BookOpen className="h-3.5 w-3.5" />
              {referenceLabel}
            </p>
            <p className="text-sm font-semibold leading-relaxed text-ink-soft">
              “{verseText}”
            </p>
          </div>
        ) : null}

        <SegmentList
          segments={segments}
          tokens={tokens}
          onAdd={addSegment}
          onRemove={removeSegment}
          onUpdate={updateSegment}
          canAdd={canAdd}
          addHint={addHint}
        />

        {errors.length > 0 ? (
          <div className="rounded-2xl bg-danger-soft px-4 py-3">
            <ul className="space-y-1 text-sm font-bold text-danger">
              {errors.map((error) => (
                <li key={error} className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="space-y-2 border-t border-border pt-5">
          <Button
            variant="accent"
            size="lg"
            fullWidth
            disabled={!canSubmit}
            onClick={handleSubmit}
            iconLeft={<CheckCircle2 className="h-5 w-5" />}
          >
            Cadastrar Versículo
          </Button>
          <p className="text-center text-xs font-semibold text-muted">
            Tudo pronto? Clique acima para cadastrar o versículo e gerar os jogos
            infantis!
          </p>
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingReference)}
        title="Trocar a referência?"
        message="Trocar a referência apaga todos os trechos já criados. Deseja continuar?"
        confirmLabel="Trocar referência"
        cancelLabel="Cancelar"
        tone="danger"
        onConfirm={() => {
          if (pendingReference) applyReference(pendingReference)
          setPendingReference(null)
        }}
        onCancel={() => setPendingReference(null)}
      />

      <DuplicateVerseModal
        open={duplicateOpen}
        referenceLabel={referenceLabel}
        onClose={() => setDuplicateOpen(false)}
      />

      <RegisterSuccessModal
        open={successOpen}
        referenceLabel={savedVerse?.referenceLabel ?? referenceLabel}
        onClose={() => {
          setSuccessOpen(false)
          resetForm()
        }}
        onContinue={() => {
          setSuccessOpen(false)
          resetForm()
        }}
      />
    </PageContainer>
  )
}
