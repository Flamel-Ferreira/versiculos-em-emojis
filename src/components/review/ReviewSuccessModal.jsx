import { PartyPopper } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

export function ReviewSuccessModal({ open, referenceLabel, onRetry, onBack }) {
  return (
    <Modal
      open={open}
      onClose={onBack}
      title="Parabéns! 🎉"
      description={
        referenceLabel
          ? `Você organizou perfeitamente: ${referenceLabel}!`
          : 'Você organizou perfeitamente o versículo!'
      }
      size="sm"
      icon={<PartyPopper className="h-7 w-7" />}
    >
      <div className="flex flex-col gap-3">
        <Button variant="accent" fullWidth onClick={onRetry}>
          Tentar novamente
        </Button>
        <Button variant="secondary" fullWidth onClick={onBack}>
          Voltar para a galeria
        </Button>
      </div>
    </Modal>
  )
}
