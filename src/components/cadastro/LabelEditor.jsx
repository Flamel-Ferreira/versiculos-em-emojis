import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { MAX_LABEL_LENGTH } from '../../config/theme'

export function LabelEditor({ value, onChange }) {
  const [editing, setEditing] = useState(false)

  if (value || editing) {
    return (
      <div className="flex min-w-[160px] flex-1 items-center gap-1.5 rounded-2xl bg-surface px-2.5 py-1.5 ring-1 ring-border">
        <input
          value={value ?? ''}
          autoFocus={editing}
          maxLength={MAX_LABEL_LENGTH}
          placeholder="Ex.: Amor de Deus"
          onChange={(event) => onChange?.(event.target.value)}
          onBlur={() => setEditing(false)}
          className="min-w-0 flex-1 bg-transparent text-sm font-bold text-ink outline-none placeholder:font-semibold placeholder:text-muted/70"
        />
        <button
          type="button"
          onClick={() => {
            onChange?.('')
            setEditing(false)
          }}
          aria-label="Remover rótulo"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted transition hover:bg-danger-soft hover:text-danger"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="flex min-w-[120px] items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border bg-surface px-3 py-2 text-xs font-extrabold text-muted transition hover:border-accent hover:text-accent"
    >
      <Plus className="h-3.5 w-3.5" />
      Rótulo
    </button>
  )
}
