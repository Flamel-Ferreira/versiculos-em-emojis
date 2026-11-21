import { AlertTriangle } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

export function DuplicateVerseModal({ open, referenceLabel, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Versículo já cadastrado"
      icon={<AlertTriangle className="h-7 w-7" />}
      size="sm"
      footer={
        <Button variant="secondary" fullWidth onClick={onClose}>
          Entendi
        </Button>
      }
    >
      <div className="space-y-3 text-sm font-semibold leading-relaxed text-ink-soft">
        <p>
          Já existe um versículo com a referência{' '}
          <strong className="text-ink">{referenceLabel}</strong>. Não é permitido
          cadastrar duplicatas.
        </p>
        <p>
          Se quiser cadastrá-lo novamente, exclua manualmente a versão existente
          na galeria de versículos antes de cadastrar esta referência.
        </p>
      </div>
    </Modal>
  )
}
