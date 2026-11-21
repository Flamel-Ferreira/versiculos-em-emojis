import { CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

export function RegisterSuccessModal({
  open,
  referenceLabel,
  onClose,
  onContinue,
}) {
  const navigate = useNavigate()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Versículo cadastrado com sucesso! 🎉"
      description={referenceLabel}
      size="sm"
      icon={<CheckCircle2 className="h-7 w-7" />}
    >
      <div className="flex flex-col gap-3">
        <Button variant="accent" fullWidth onClick={onContinue}>
          Continuar cadastrando
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigate('/versiculos')}
        >
          Ir para a galeria
        </Button>
      </div>
    </Modal>
  )
}
