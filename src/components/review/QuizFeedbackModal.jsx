import { CheckCircle2, XCircle } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

export function QuizFeedbackModal({
  open,
  correct,
  correctReference,
  onRetry,
  onBack,
}) {
  return (
    <Modal
      open={open}
      onClose={onBack}
      title={correct ? 'Acertou! 🎉' : 'Quase lá!'}
      description={
        correct
          ? 'Você identificou o versículo corretamente.'
          : `A resposta correta era ${correctReference}.`
      }
      size="sm"
      icon={
        correct ? (
          <CheckCircle2 className="h-7 w-7" />
        ) : (
          <XCircle className="h-7 w-7" />
        )
      }
    >
      <div className="flex flex-col gap-3">
        <Button variant={correct ? 'accent' : 'primary'} fullWidth onClick={onRetry}>
          Tentar novamente
        </Button>
        <Button variant="secondary" fullWidth onClick={onBack}>
          Voltar para a galeria
        </Button>
      </div>
    </Modal>
  )
}
