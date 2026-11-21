import { AlertTriangle, ArrowRight, FileJson, GitMerge } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

export function ImportModeModal({
  open,
  fileName,
  verseCount,
  onReplace,
  onMerge,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Como deseja importar?"
      description={
        fileName
          ? `${fileName} · ${verseCount} ${verseCount === 1 ? 'versículo' : 'versículos'}`
          : undefined
      }
      size="md"
      icon={<FileJson className="h-7 w-7" />}
    >
      <div className="space-y-3">
        <button
          type="button"
          onClick={onReplace}
          className="flex w-full items-start gap-3 rounded-2xl border border-danger/30 bg-danger-soft/60 p-4 text-left transition hover:bg-danger-soft"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-sm font-black text-ink">
              Substituir tudo
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
            <span className="mt-1 block text-xs font-semibold leading-relaxed text-ink-soft">
              Todos os versículos e progressos deste navegador serão apagados e
              substituídos pelos do arquivo.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onMerge}
          className="flex w-full items-start gap-3 rounded-2xl border border-border bg-surface-muted/60 p-4 text-left transition hover:bg-surface-muted"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <GitMerge className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-sm font-black text-ink">
              Mesclar
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
            <span className="mt-1 block text-xs font-semibold leading-relaxed text-ink-soft">
              Adiciona os versículos do arquivo aos atuais. Em caso de referências
              duplicadas, os dados locais serão substituídos pelos do arquivo.
            </span>
          </span>
        </button>

        <p className="rounded-2xl bg-primary-soft px-4 py-3 text-xs font-bold text-[#8a5a00]">
          Suas preferências (como o som) não serão alteradas.
        </p>

        <Button variant="secondary" fullWidth onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </Modal>
  )
}
