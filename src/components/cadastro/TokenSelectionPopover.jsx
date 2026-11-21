import { useEffect, useMemo, useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { cn } from '../../lib/cn'
import { segmentTextFromTokens } from '../../lib/tokenize'

export function TokenSelectionPopover({
  open,
  onClose,
  tokens = [],
  allowedRange,
  initialRange,
  onApply,
}) {
  const min = allowedRange?.min ?? 0
  const max = allowedRange?.max ?? tokens.length - 1
  const initialStart = initialRange?.start ?? null
  const initialEnd = initialRange?.end ?? null
  const [selection, setSelection] = useState(initialRange ?? null)
  const [hint, setHint] = useState('')

  // Reinicia a seleção sempre que o popover abre para outro trecho.
  useEffect(() => {
    if (!open) return
    setSelection(
      Number.isInteger(initialStart) && Number.isInteger(initialEnd)
        ? { start: initialStart, end: initialEnd }
        : null,
    )
    setHint('')
  }, [open, initialStart, initialEnd, min, max])

  const selectedSet = useMemo(() => {
    if (!selection) return new Set()
    const set = new Set()
    for (let i = selection.start; i <= selection.end; i += 1) set.add(i)
    return set
  }, [selection])

  function handleToken(index) {
    if (index < min || index > max) return

    if (!selection) {
      setSelection({ start: index, end: index })
      setHint('')
      return
    }

    const { start, end } = selection

    if (index === start && index === end) {
      setSelection(null)
      setHint('')
      return
    }

    if (index === start) {
      setSelection({ start: start + 1, end })
      setHint('')
      return
    }

    if (index === end) {
      setSelection({ start, end: end - 1 })
      setHint('')
      return
    }

    if (index < start) {
      setSelection({ start: index, end })
      setHint('')
      return
    }

    if (index > end) {
      setSelection({ start, end: index })
      setHint('')
      return
    }

    setHint('Selecione apenas pelas extremidades.')
  }

  function apply() {
    if (!selection) return
    const text = segmentTextFromTokens(tokens, selection.start, selection.end)
    onApply?.({ ...selection, text })
    onClose?.()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="✨ Toque nas palavras para adicionar a este trecho:"
      description="A seleção precisa ser contígua. Clique nas extremidades para ajustar."
      size="lg"
    >
      <div className="max-h-[45vh] overflow-y-auto rounded-2xl bg-surface-muted p-3">
        <div className="flex flex-wrap gap-1.5">
          {tokens.map((token, index) => {
            const disabled = index < min || index > max
            const selected = selectedSet.has(index)

            return (
              <button
                key={`${token}-${index}`}
                type="button"
                disabled={disabled}
                onClick={() => handleToken(index)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-sm font-bold transition',
                  selected && 'bg-accent text-white shadow-sm',
                  !selected &&
                    !disabled &&
                    'bg-surface text-ink hover:bg-surface-strong',
                  disabled && 'cursor-not-allowed bg-surface/40 text-muted/40',
                )}
              >
                {selected ? <Check className="h-3 w-3" /> : null}
                {token}
              </button>
            )
          })}
        </div>
      </div>

      {hint ? (
        <p className="mt-2 text-xs font-bold text-danger">{hint}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (max < min) return
              setSelection({ start: min, end: max })
              setHint('')
            }}
            className="rounded-full bg-surface-muted px-3 py-2 text-xs font-extrabold text-ink transition hover:bg-surface-strong"
          >
            Selecionar todas
          </button>
          <button
            type="button"
            onClick={() => {
              setSelection(null)
              setHint('')
            }}
            className="rounded-full px-3 py-2 text-xs font-extrabold text-muted transition hover:bg-surface-muted hover:text-ink"
          >
            Limpar
          </button>
        </div>

        <Button
          variant="primary"
          size="sm"
          iconLeft={<Sparkles className="h-4 w-4" />}
          disabled={!selection}
          onClick={apply}
        >
          Aplicar trecho
        </Button>
      </div>
    </Modal>
  )
}
