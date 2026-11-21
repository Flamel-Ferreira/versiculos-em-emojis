import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpenCheck,
  GraduationCap,
  ListFilter,
  Plus,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { PageContainer } from '../components/layout/PageContainer'
import { BackButton } from '../components/layout/BackButton'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { SegmentedToggle } from '../components/ui/SegmentedToggle'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { VerseCard } from '../components/verses/VerseCard'
import { ReviewModeModal } from '../components/verses/ReviewModeModal'
import { useAppData } from '../context/AppDataContext'
import { useToast } from '../context/ToastContext'
import { cn } from '../lib/cn'

const MODE_OPTIONS = [
  {
    value: 'learn',
    label: 'Aprendizado',
    icon: <GraduationCap className="h-4 w-4" />,
  },
  { value: 'review', label: 'Revisão', icon: <Sparkles className="h-4 w-4" /> },
]

export function GalleryPage() {
  const { verses, learnedCount, reviewedCount, deleteVerse } = useAppData()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [mode, setMode] = useState('learn')
  const [filter, setFilter] = useState('all')
  const [reviewModalVerseId, setReviewModalVerseId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const reviewList = useMemo(
    () => verses.filter((verse) => verse.progress.learned),
    [verses],
  )

  const baseList = mode === 'learn' ? verses : reviewList

  const filtered = useMemo(() => {
    if (filter === 'all') return baseList

    if (mode === 'learn') {
      return baseList.filter((verse) =>
        filter === 'done' ? verse.progress.learned : !verse.progress.learned,
      )
    }

    return baseList.filter((verse) =>
      filter === 'done'
        ? verse.progress.reviewModes.length > 0
        : verse.progress.reviewModes.length === 0,
    )
  }, [baseList, filter, mode])

  const filterOptions =
    mode === 'learn'
      ? [
          { value: 'all', label: 'Todos' },
          { value: 'done', label: 'Aprendidos' },
          { value: 'pending', label: 'Não aprendidos' },
        ]
      : [
          { value: 'all', label: 'Todos' },
          { value: 'done', label: 'Revisados' },
          { value: 'pending', label: 'Não revisados' },
        ]

  const reviewVerse = verses.find((verse) => verse.id === reviewModalVerseId) ?? null

  function changeMode(next) {
    setMode(next)
    setFilter('all')
  }

  function handleAction(verse) {
    if (mode === 'learn') {
      navigate(`/versiculos/${verse.id}/aprender`)
      return
    }
    setReviewModalVerseId(verse.id)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    deleteVerse(deleteTarget.id)
    toast.success('Versículo excluído')
    setDeleteTarget(null)
  }

  const showGlobalEmpty = mode === 'learn' && verses.length === 0
  const showReviewEmpty = mode === 'review' && reviewList.length === 0

  return (
    <PageContainer className="space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 w-full">
            <BackButton to="/" label="Voltar" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
                Galeria Bíblica
              </p>
              <h1 className="text-3xl font-black tracking-tight text-ink">
                Versículos
              </h1>
            </div>
            <SegmentedToggle
              options={MODE_OPTIONS}
              value={mode}
              onChange={changeMode}
              ariaLabel="Modo da galeria"
            />
          </div>

        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">
              📌
            </span>
            <div>
              <p className="text-sm font-black text-ink">
                Vamos memorizar juntos!
              </p>
              <p className="text-xs font-semibold text-muted">
                Toque nos cartões para aprender e memorizar a Palavra de Deus.
              </p>
            </div>
          </div>

          <Badge tone="olive" icon={<Trophy className="h-4 w-4" />}>
            {mode === 'learn'
              ? `Aprendidos ${learnedCount} de ${verses.length}`
              : `Revisados ${reviewedCount} de ${learnedCount}`}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-muted">
            <ListFilter className="h-3.5 w-3.5" />
            Filtrar
          </span>
          {filterOptions.map((option) => {
            const active = filter === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                aria-pressed={active}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-extrabold transition',
                  active
                    ? 'bg-ink text-white'
                    : 'bg-surface-muted text-ink-soft hover:bg-surface-strong',
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </Card>

      {showGlobalEmpty ? (
        <EmptyState
          icon={<BookOpenCheck className="h-8 w-8" />}
          title="Nenhum versículo cadastrado ainda"
          description="Cadastre o primeiro versículo para começar a criar enigmas com emojis."
          action={
            <Button
              to="/cadastrar"
              variant="primary"
              iconLeft={<Plus className="h-5 w-5" />}
            >
              Cadastrar primeiro versículo
            </Button>
          }
        />
      ) : showReviewEmpty ? (
        <EmptyState
          icon={<GraduationCap className="h-8 w-8" />}
          title="Nenhum versículo aprendido ainda"
          description="Aprenda um versículo para liberar a revisão."
          action={
            <Button
              variant="accent"
              onClick={() => changeMode('learn')}
              iconLeft={<Sparkles className="h-5 w-5" />}
            >
              Ir para o aprendizado
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ListFilter className="h-8 w-8" />}
          title="Nenhum versículo neste filtro"
          description="Escolha outro filtro para ver seus versículos."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((verse) => (
            <VerseCard
              key={verse.id}
              verse={verse}
              mode={mode}
              onAction={handleAction}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <ReviewModeModal
        open={Boolean(reviewVerse)}
        onClose={() => setReviewModalVerseId(null)}
        verse={reviewVerse}
        canQuiz={verses.length >= 3}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir versículo?"
        message={
          deleteTarget
            ? `Excluir ${deleteTarget.referenceLabel}? Todo o progresso desse versículo será perdido.`
            : ''
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        tone="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageContainer>
  )
}
