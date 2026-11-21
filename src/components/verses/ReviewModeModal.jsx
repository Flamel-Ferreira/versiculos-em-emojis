import { useNavigate } from 'react-router-dom'
import { ListOrdered, Sparkles } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

export function ReviewModeModal({ open, onClose, verse, canQuiz }) {
  const navigate = useNavigate()

  if (!verse) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Como você quer revisar?"
      description={verse.referenceLabel}
      size="sm"
      icon={<Sparkles className="h-7 w-7" />}
    >
      <div className="space-y-3">
        <Button
          variant="accent"
          fullWidth
          iconLeft={<ListOrdered className="h-5 w-5" />}
          onClick={() => {
            onClose?.()
            navigate(`/versiculos/${verse.id}/revisar/organizacao`)
          }}
        >
          Organização
        </Button>

        <div>
          <Button
            variant="primary"
            fullWidth
            iconLeft={<Sparkles className="h-5 w-5" />}
            disabled={!canQuiz}
            onClick={() => {
              onClose?.()
              navigate(`/versiculos/${verse.id}/revisar/quiz`)
            }}
          >
            Quiz
          </Button>
          {!canQuiz ? (
            <p className="mt-2 text-center text-xs font-bold text-danger">
              Cadastre pelo menos 3 versículos para desbloquear o Quiz.
            </p>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}
