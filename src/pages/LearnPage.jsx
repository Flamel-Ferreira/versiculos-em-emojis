import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { PageContainer } from '../components/layout/PageContainer'
import { PageTopBar } from '../components/layout/PageTopBar'
import { MemorizePanel } from '../components/learn/MemorizePanel'
import { useAppData } from '../context/AppDataContext'
import { useToast } from '../context/ToastContext'
import { useSound } from '../hooks/useSound'
import { useEmojiBurst } from '../hooks/useEmojiBurst'

export function LearnPage() {
  const { verseId } = useParams()
  const navigate = useNavigate()
  const { getVerse, markLearned, ready } = useAppData()
  const { toast } = useToast()
  const { playSuccess, playReveal } = useSound()
  const { burst } = useEmojiBurst()

  const verse = getVerse(verseId)
  const [hiddenIds, setHiddenIds] = useState(() => new Set())

  useEffect(() => {
    if (!ready || verse) return
    toast.error('Versículo não encontrado')
    navigate('/versiculos', { replace: true })
  }, [ready, verse, toast, navigate])

  if (!verse) return null

  const allHidden = verse.segments.every((segment) => hiddenIds.has(segment.id))

  function toggleSegment(segment) {
    const isHidden = hiddenIds.has(segment.id)

    if (isHidden) {
      setHiddenIds((current) => {
        const next = new Set(current)
        next.delete(segment.id)
        return next
      })
      playReveal()
      return
    }

    const next = new Set(hiddenIds)
    next.add(segment.id)
    setHiddenIds(next)
    burst([segment.emoji])
    playSuccess()

    if (next.size === verse.segments.length && !verse.progress.learned) {
      markLearned(verse.id)
    }
  }

  function hideAll() {
    if (allHidden) return
    setHiddenIds(new Set(verse.segments.map((segment) => segment.id)))
    burst(verse.segments.map((segment) => segment.emoji))
    playSuccess()
    if (!verse.progress.learned) markLearned(verse.id)
  }

  function revealAll() {
    if (hiddenIds.size === 0) return
    setHiddenIds(new Set())
    playReveal()
  }

  return (
    <PageContainer className="max-w-[980px] space-y-5">
      <PageTopBar
        backTo="/versiculos"
        backLabel="Voltar"
        title="Versículo"
        subtitle="Modo Memorização com Emojis"
      />

      {verse.segments.length < 3 ? (
        <div className="flex items-start gap-3 rounded-2xl bg-primary-soft px-4 py-3 text-sm font-bold text-[#8a5a00]">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          Este versículo tem menos de 3 trechos e os jogos estão bloqueados. Você
          ainda pode visualizar os trechos existentes.
        </div>
      ) : null}

      <MemorizePanel
        verse={verse}
        hiddenIds={hiddenIds}
        onToggleSegment={toggleSegment}
        onHideAll={hideAll}
        onRevealAll={revealAll}
      />
    </PageContainer>
  )
}
