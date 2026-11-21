import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { EmojiPickerButton } from '../emoji/EmojiPickerButton'
import { ColorPalette } from './ColorPalette'
import { LabelEditor } from './LabelEditor'
import { TokenSelectionPopover } from './TokenSelectionPopover'
import { cn } from '../../lib/cn'

export function SegmentEditor({
  index,
  segment,
  tokens,
  allowedRange,
  onUpdate,
  onRemove,
}) {
  const [open, setOpen] = useState(false)
  const hasText = Boolean(segment.text)

  return (
    <div className="rounded-3xl border border-border bg-surface-muted p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-extrabold text-ink">
          Trecho {index + 1}
          {hasText ? (
            <span className="ml-2 text-xs font-bold text-muted">
              tokens {segment.startToken}–{segment.endToken}
            </span>
          ) : null}
        </p>
        <button
          type="button"
          onClick={() => onRemove?.(segment.localId ?? segment.id)}
          aria-label={`Excluir trecho ${index + 1}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted transition hover:bg-danger-soft hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex min-h-12 w-full items-center rounded-2xl border bg-surface px-4 py-2 text-left text-sm font-bold transition hover:border-accent',
          hasText
            ? 'border-border text-ink'
            : 'border-dashed border-border text-muted',
        )}
      >
        {hasText ? segment.text : 'Toque aqui para escolher as palavras'}
      </button>

      <div className="no-scrollbar mt-3 flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
        <EmojiPickerButton
          value={segment.emoji}
          colorId={segment.colorId}
          onChange={(emoji) => onUpdate?.({ emoji })}
        />
        <ColorPalette
          value={segment.colorId}
          onChange={(colorId) => onUpdate?.({ colorId })}
        />
        <LabelEditor
          value={segment.label}
          onChange={(label) => onUpdate?.({ label: label || null })}
        />
      </div>

      <TokenSelectionPopover
        open={open}
        onClose={() => setOpen(false)}
        tokens={tokens}
        allowedRange={allowedRange}
        initialRange={
          Number.isInteger(segment.startToken) &&
          Number.isInteger(segment.endToken)
            ? { start: segment.startToken, end: segment.endToken }
            : null
        }
        onApply={({ start, end, text }) =>
          onUpdate?.({ startToken: start, endToken: end, text })
        }
      />
    </div>
  )
}
