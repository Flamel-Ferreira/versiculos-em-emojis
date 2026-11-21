import { Plus, Scissors } from 'lucide-react'
import { SegmentEditor } from './SegmentEditor'
import { getAllowedRange } from '../../lib/segments'

export function SegmentList({
  segments = [],
  tokens = [],
  onAdd,
  onRemove,
  onUpdate,
  canAdd,
  addHint,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-[#8a5a00]">
          <Scissors className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-black tracking-tight text-ink">
          Trechos do Versículo
        </h2>
        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-extrabold text-muted">
          {segments.length}
        </span>
      </div>

      {segments.length === 0 ? (
        <p className="rounded-2xl bg-surface-muted px-4 py-5 text-center text-sm font-semibold text-muted">
          Nenhum trecho ainda. Escolha a referência e adicione o primeiro trecho.
        </p>
      ) : (
        <div className="space-y-3">
          {segments.map((segment, index) => (
            <SegmentEditor
              key={segment.localId ?? segment.id}
              index={index}
              segment={segment}
              tokens={tokens}
              allowedRange={getAllowedRange(segments, index, tokens.length)}
              onUpdate={(patch) =>
                onUpdate?.(segment.localId ?? segment.id, patch)
              }
              onRemove={onRemove}
            />
          ))}
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={onAdd}
          disabled={!canAdd}
          title={!canAdd ? addHint : undefined}
          className="inline-flex items-center w-full flex justify-center h-14 gap-2 rounded-full bg-surface-muted px-4 py-2.5 text-sm font-extrabold text-ink transition hover:bg-surface-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className='p-1 bg-yellow-500 w-6 h-6 flex justify-center items-center text-xl rounded-2xl'>+</div>
          Adicionar novo trecho
        </button>
        {!canAdd && addHint ? (
          <p className="mt-2 text-xs font-bold text-muted">{addHint}</p>
        ) : null}
      </div>
    </div>
  )
}
