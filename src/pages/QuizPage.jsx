import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Puzzle } from 'lucide-react'
import { PageContainer } from '../components/layout/PageContainer'
import { BackButton } from '../components/layout/BackButton'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Emoji } from '../components/emoji/Emoji'
import { QuizOptionCard } from '../components/review/QuizOptionCard'
import { QuizFeedbackModal } from '../components/review/QuizFeedbackModal'
import { useAppData } from '../context/AppDataContext'
import { useToast } from '../context/ToastContext'
import { useSound } from '../hooks/useSound'
import { useEmojiBurst } from '../hooks/useEmojiBurst'
import { buildQuizOptions } from '../lib/quiz'

export function QuizPage() {
  const { verseId } = useParams()
  const navigate = useNavigate()
  const { getVerse, verses, markReviewed, ready } = useAppData()
  const { toast } = useToast()
  const { playSuccess } = useSound()
  const { burst } = useEmojiBurst()

  const verse = getVerse(verseId)
  const [options, setOptions] = useState(() =>
    verse ? buildQuizOptions(verse, verses) : [],
  )
  const [selectedId, setSelectedId] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const reviewedRef = useRef(false)

  useEffect(() => {
    if (!ready) return

    if (!verse) {
      toast.error('Versículo não encontrado')
      navigate('/versiculos', { replace: true })
      return
    }

    if (!verse.progress.learned) {
      toast.error('Aprenda o versículo antes de revisar')
      navigate('/versiculos', { replace: true })
      return
    }

    if (verses.length < 3) {
      toast.error('Cadastre pelo menos 3 versículos para desbloquear o Quiz.')
      navigate('/versiculos', { replace: true })
    }
  }, [ready, verse, verses.length, toast, navigate])

  useEffect(() => {
    if (!verse) return
    setOptions(buildQuizOptions(verse, verses))
    setSelectedId(null)
    setFeedback(null)
    reviewedRef.current = false
    // Regera apenas ao trocar de versículo-alvo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verse?.id])

  if (!verse) return null

  function submit() {
    if (!selectedId) return

    const correct = selectedId === verse.id
    setFeedback({ correct })

    if (correct && !reviewedRef.current) {
      reviewedRef.current = true
      markReviewed(verse.id, 'quiz')
      burst(verse.segments.map((segment) => segment.emoji))
      playSuccess()
    }

    setModalOpen(true)
  }

  function retry() {
    setModalOpen(false)
    setSelectedId(null)
    setFeedback(null)
    reviewedRef.current = false
    setOptions(buildQuizOptions(verse, verses))
  }

  return (
    <PageContainer className="max-w-[900px] space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-[1.75rem] border border-border bg-surface px-4 py-3 shadow-[var(--shadow-soft)]">
        <BackButton to="/versiculos" label="Voltar" className="shadow-none" />
        <h1 className="text-lg font-black tracking-tight text-ink sm:text-xl">
          Quiz Bíblico
        </h1>
        <span className="w-[92px]" aria-hidden="true" />
      </div>

      <Card className="space-y-4">
        <Badge tone="accent" icon={<Puzzle className="h-4 w-4" />}>
          Desafio de Decodificação
        </Badge>
        <h2 className="text-xl font-black tracking-tight text-ink sm:text-2xl">
          Que versículo é representado por esta sequência de emojis?
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl bg-surface-muted px-3 py-4">
          {verse.segments.map((segment, index) => (
            <span key={segment.id} className="flex items-center gap-1">
              <Emoji char={segment.emoji} size={36} decorative />
              {index < verse.segments.length - 1 ? (
                <ChevronRight className="h-4 w-4 text-muted" />
              ) : null}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <QuizOptionCard
            key={option.verseId}
            letter={option.letter}
            referenceLabel={option.referenceLabel}
            text={option.text}
            selected={selectedId === option.verseId}
            onSelect={() => setSelectedId(option.verseId)}
          />
        ))}
      </div>

      <Button
        variant="accent"
        size="lg"
        fullWidth
        disabled={!selectedId}
        onClick={submit}
        iconRight={<span aria-hidden="true">→</span>}
      >
        Enviar Resposta
      </Button>

      <QuizFeedbackModal
        open={modalOpen}
        correct={Boolean(feedback?.correct)}
        correctReference={verse.referenceLabel}
        onRetry={retry}
        onBack={() => navigate('/versiculos')}
      />
    </PageContainer>
  )
}
