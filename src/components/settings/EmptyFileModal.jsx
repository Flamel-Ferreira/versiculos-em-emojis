import { AlertTriangle } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

const MESSAGES = {
  empty: 'O arquivo está vazio. Nenhum dado foi importado.',
  'no-valid':
    'Nenhum versículo válido foi encontrado no arquivo. Nenhum dado foi importado.',
}

export function EmptyFileModal({ open, reason = 'empty', onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Arquivo vazio"
      icon={<AlertTriangle className="h-7 w-7" />}
      size="sm"
      footer={
        <Button variant="secondary" fullWidth onClick={onClose}>
          Entendi
        </Button>
      }
    >
      <p className="text-sm font-semibold leading-relaxed text-ink-soft">
        {MESSAGES[reason] ?? MESSAGES.empty}
      </p>
    </Modal>
  )
}
