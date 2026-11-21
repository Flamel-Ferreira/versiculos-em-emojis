import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ListOrdered, Star } from 'lucide-react'
import { PageContainer } from '../components/layout/PageContainer'
import { BackButton } from '../components/layout/BackButton'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { OrganizeBoard } from '../components/review/OrganizeBoard'
import { ReviewSuccessModal } from '../components/review/ReviewSuccessModal'
import { useAppData } from '../context/AppDataContext'
import { useToast } from '../context/ToastContext'
import { useSound } from '../hooks/useSound'
import { useEmojiBurst } from '../hooks/useEmojiBurst'

export function OrganizePage() {
  const { verseId } = useParams()
  const navigate = useNavigate()
  const { getVerse, markReviewed, ready } = useAppData()
  const { toast } = useToast()
  const { playSuccess } = useSound()
  const { burst } = useEmojiBurst()

  const verse = getVerse(verseId)
  const [round, setRound] = useState(0)
  const [successOpen, setSuccessOpen] = useState(false)
  const solvedRef = useRef(false)

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

    if (verse.segments.length < 3) {
      toast.error('Este versículo precisa de pelo menos 3 trechos para jogar.')
      navigate('/versiculos', { replace: true })
    }
  }, [ready, verse, toast, navigate])

  if (!verse) return null

  function handleSolved() {
    if (solvedRef.current) return
    solvedRef.current = true
    markReviewed(verse.id, 'organization')
    burst(verse.segments.map((segment) => segment.emoji))
    playSuccess()
    setSuccessOpen(true)
  }

  function retry() {
    solvedRef.current = false
    setSuccessOpen(false)
    setRound((value) => value + 1)
  }

  return (
    <PageContainer className="max-w-[980px] space-y-5">
      <BackButton to="/versiculos" label="Voltar" />

      <Card className="space-y-3 text-center">
        <Badge tone="primary" icon={<Star className="h-4 w-4" />}>
          DESAFIO: ORGANIZE
        </Badge>
        <h1 className="text-3xl font-black tracking-tight text-accent sm:text-4xl">
          {verse.referenceLabel}
        </h1>
        <p className="mx-auto max-w-2xl text-sm font-semibold leading-relaxed text-muted">
          Toque nos emojis abaixo para colocá-los na sequência certa da história
          bíblica!
        </p>
        <span className="sr-only">
          <ListOrdered />
        </span>
      </Card>

      <OrganizeBoard
        key={`${verse.id}-${round}`}
        verse={verse}
        onSolved={handleSolved}
      />

      <ReviewSuccessModal
        open={successOpen}
        referenceLabel={verse.referenceLabel}
        onRetry={retry}
        onBack={() => navigate('/versiculos')}
      />
    </PageContainer>
  )
}
