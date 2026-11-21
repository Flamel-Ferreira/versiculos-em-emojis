import { BookOpen, Eye, EyeOff, Sparkles } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { KeywordCounter } from './KeywordCounter'
import { SegmentToggleCard } from './SegmentToggleCard'
import { VerseRenderer } from '../verses/VerseRenderer'
import { Emoji } from '../emoji/Emoji'

export function MemorizePanel({
  verse,
  hiddenIds,
  onToggleSegment,
  onHideAll,
  onRevealAll,
}) {
  const allHidden =
    verse.segments.length > 0 &&
    verse.segments.every((segment) => hiddenIds.has(segment.id))

  return (
    <div className="space-y-5">
      <Card className="relative space-y-5 pb-12">
        <KeywordCounter count={verse.segments.length} />

        <VerseRenderer verse={verse} hiddenSegmentIds={hiddenIds} />

        <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-xs font-extrabold text-white">
          <BookOpen className="h-3.5 w-3.5" />
          {verse.referenceLabel}
        </span>
      </Card>

      <p className="text-center text-sm font-extrabold text-ink-soft">
        ✋ Toque nos emojis para esconder ou revelar palavras!
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {verse.segments.map((segment) => (
          <SegmentToggleCard
            key={segment.id}
            segment={segment}
            hidden={hiddenIds.has(segment.id)}
            onToggle={onToggleSegment}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          variant="secondary"
          iconLeft={<EyeOff className="h-5 w-5" />}
          onClick={onHideAll}
          disabled={allHidden}
        >
          Esconder tudo
        </Button>
        <Button
          variant="primary"
          iconLeft={<Eye className="h-5 w-5" />}
          iconRight={<Sparkles className="h-4 w-4" />}
          onClick={onRevealAll}
          disabled={hiddenIds.size === 0}
        >
          Revelar tudo
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 rounded-2xl bg-surface-muted px-4 py-3 text-xs font-bold text-muted">
        <Emoji char="💡" size={18} decorative />
        {allHidden
          ? 'Muito bem! Você escondeu todos os trechos.'
          : 'Dica: esconda os trechos aos poucos e tente lembrar o versículo.'}
      </div>
    </div>
  )
}
