import { ArrowRight, Sparkles, Trash2 } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { VerseStatusTag } from './VerseStatusTag'
import { VerseEmojiStrip } from './VerseEmojiStrip'
import { cn } from '../../lib/cn'

export function VerseCard({ verse, mode = 'learn', onAction, onDelete }) {
  const learned = verse.progress.learned
  const reviewModes = verse.progress.reviewModes ?? []
  const hasEnoughSegments = verse.segments.length >= 3

  return (
    <Card className="relative flex h-full flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft-lg)]">
      <div className="flex items-start justify-between gap-3 pr-1">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-black tracking-tight text-ink">
            {verse.referenceLabel}
          </h3>
          <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-muted">
            {verse.translation}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDelete?.(verse)}
          aria-label="Excluir versículo"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger transition hover:bg-[#fdd0d0]"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <VerseStatusTag
        mode={mode}
        learned={learned}
        reviewModes={reviewModes}
      />

      <VerseEmojiStrip segments={verse.segments} />

      <p className="line-clamp-2 flex-1 text-sm font-semibold leading-relaxed text-ink-soft">
        “{verse.fullText}”
      </p>

      <div className="space-y-2">
        <Button
          variant={mode === 'learn' ? 'primary' : 'accent'}
          size="sm"
          fullWidth
          iconLeft={<Sparkles className="h-4 w-4" />}
          iconRight={<ArrowRight className="h-4 w-4" />}
          onClick={() => onAction?.(verse)}
          disabled={!hasEnoughSegments}
        >
          {mode === 'learn' ? 'Aprender versículo' : 'Revisar versículo'}
        </Button>
        {!hasEnoughSegments ? (
          <p className={cn('text-center text-xs font-bold text-danger')}>
            Este versículo precisa de pelo menos 3 trechos para jogar.
          </p>
        ) : null}
      </div>
    </Card>
  )
}
