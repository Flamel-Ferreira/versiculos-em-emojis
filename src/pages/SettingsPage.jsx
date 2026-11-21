import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Database,
  Download,
  Info,
  Music2,
  Settings2,
  Trash2,
  Upload,
} from 'lucide-react'
import { PageContainer } from '../components/layout/PageContainer'
import { BackButton } from '../components/layout/BackButton'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ImportModeModal } from '../components/settings/ImportModeModal'
import { EmptyFileModal } from '../components/settings/EmptyFileModal'
import { useAppData } from '../context/AppDataContext'
import { useToast } from '../context/ToastContext'
import { exportBackup, importBackup } from '../services/backup'
import { APP_NAME } from '../config/theme'
import { verseReferenceKey } from '../lib/verseSchema'
import { cn } from '../lib/cn'

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'relative h-8 w-14 shrink-0 rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-surface-strong',
      )}
    >
      <span
        className={cn(
          'absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transition-all',
          checked ? 'left-7' : 'left-1',
        )}
      >
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            checked ? 'bg-primary' : 'bg-muted',
          )}
        />
      </span>
    </button>
  )
}

export function SettingsPage() {
  const {
    verses,
    settings,
    replaceAll,
    resetAll,
    updateSettings,
  } = useAppData()
  const { toast } = useToast()
  const navigate = useNavigate()

  const fileInputRef = useRef(null)
  const [pendingImport, setPendingImport] = useState(null)
  const [importOpen, setImportOpen] = useState(false)
  const [emptyFile, setEmptyFile] = useState({ open: false, reason: 'empty' })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [importing, setImporting] = useState(false)

  function handleExport() {
    exportBackup({ settings, verses })
    toast.success('Backup exportado')
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    setImporting(true)
    const result = await importBackup(file)
    setImporting(false)

    if (result.error === 'invalid') {
      toast.error('Arquivo inválido')
      return
    }

    if (result.error === 'empty' || result.error === 'no-valid') {
      setEmptyFile({ open: true, reason: result.error })
      return
    }

    const { data, fileName } = result

    if (verses.length === 0) {
      replaceAll(data.verses)
      if (data.ignored > 0) {
        toast.info(`${data.ignored} versículos inválidos foram ignorados.`)
      }
      toast.success(
        `${data.verses.length} ${data.verses.length === 1 ? 'versículo importado' : 'versículos importados'}`,
      )
      navigate('/versiculos')
      return
    }

    setPendingImport({ ...data, fileName })
    setImportOpen(true)
  }

  function finishImport(importedCount) {
    setImportOpen(false)
    setPendingImport(null)
    toast.success(
      `${importedCount} ${importedCount === 1 ? 'versículo importado' : 'versículos importados'}`,
    )
    navigate('/versiculos')
  }

  function handleReplace() {
    if (!pendingImport) return
    replaceAll(pendingImport.verses)
    finishImport(pendingImport.verses.length)
  }

  function handleMerge() {
    if (!pendingImport) return

    const map = new Map(verses.map((verse) => [verseReferenceKey(verse), verse]))
    pendingImport.verses.forEach((verse) => {
      map.set(verseReferenceKey(verse), verse)
    })

    const merged = [...map.values()]
    replaceAll(merged)

    if (pendingImport.ignored > 0) {
      toast.info(`${pendingImport.ignored} versículos inválidos foram ignorados.`)
    }

    finishImport(pendingImport.verses.length)
  }

  function handleReset() {
    resetAll()
    setDeleteOpen(false)
    toast.success('Todos os dados foram apagados')
  }

  return (
    <PageContainer className="max-w-[860px] space-y-5">
      <BackButton to="/" label="Voltar ao Menu" />

      <div>
        <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">
          Configurações
        </h1>
        <p className="mt-1 text-sm font-semibold text-muted">
          Gerencie os dados e preferências do aplicativo.
        </p>
      </div>

      <Card className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Database className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-black tracking-tight text-ink">
            Dados do aplicativo
          </h2>
        </div>

        <div className="space-y-4 divide-y divide-border">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-ink">Exportar JSON</p>
              <p className="text-xs font-semibold text-muted">
                Salvar um arquivo .json com versículos, progresso e preferências.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Download className="h-4 w-4" />}
              onClick={handleExport}
            >
              Exportar JSON
            </Button>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-ink">Importar JSON</p>
              <p className="text-xs font-semibold text-muted">
                Restaurar o aplicativo a partir de um arquivo .json exportado.
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="secondary"
                size="sm"
                iconLeft={<Upload className="h-4 w-4" />}
                loading={importing}
                onClick={() => fileInputRef.current?.click()}
              >
                Importar JSON
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-ink">Deletar dados</p>
              <p className="text-xs font-semibold text-muted">
                Apagar permanentemente todos os versículos e progressos.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              iconLeft={<Trash2 className="h-4 w-4" />}
              onClick={() => setDeleteOpen(true)}
            >
              Deletar tudo
            </Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-[#8a5a00]">
            <Settings2 className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-black tracking-tight text-ink">
            Preferências
          </h2>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-muted px-4 py-3">
          <div className="flex items-start gap-3">
            <Music2 className="mt-0.5 h-5 w-5 text-muted" />
            <div>
              <p className="text-sm font-black text-ink">Sons de feedback</p>
              <p className="text-xs font-semibold text-muted">
                Toca sons ao esconder, revelar e concluir desafios.
              </p>
            </div>
          </div>
          <Toggle
            checked={settings.soundEnabled !== false}
            onChange={(value) => updateSettings({ soundEnabled: value })}
            label="Sons de feedback"
          />
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-ink-soft">
            <Info className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-black tracking-tight text-ink">Sobre</h2>
        </div>
        <div className="space-y-1 text-sm font-semibold text-ink-soft">
          <p>
            <strong className="text-ink">{APP_NAME}</strong> · versão 1.0.0
          </p>
          <p className="text-xs text-muted">
            Textos bíblicos fornecidos pela API pública bolls.life (tradução ARA).
          </p>
        </div>
      </Card>

      <ImportModeModal
        open={importOpen}
        fileName={pendingImport?.fileName}
        verseCount={pendingImport?.verses?.length ?? 0}
        onReplace={handleReplace}
        onMerge={handleMerge}
        onCancel={() => {
          setImportOpen(false)
          setPendingImport(null)
        }}
      />

      <EmptyFileModal
        open={emptyFile.open}
        reason={emptyFile.reason}
        onClose={() => setEmptyFile({ open: false, reason: 'empty' })}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Deletar todos os dados?"
        message="Todos os versículos e progressos serão apagados permanentemente. Esta ação não pode ser desfeita."
        confirmLabel="Deletar tudo"
        cancelLabel="Cancelar"
        tone="danger"
        onConfirm={handleReset}
        onCancel={() => setDeleteOpen(false)}
      />
    </PageContainer>
  )
}
