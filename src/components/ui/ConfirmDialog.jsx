import { AlertTriangle, HelpCircle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) {
  const isDanger = tone === 'danger'

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      icon={
        isDanger ? (
          <AlertTriangle className="h-7 w-7" />
        ) : (
          <HelpCircle className="h-7 w-7" />
        )
      }
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'accent'}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-base font-semibold leading-relaxed text-ink-soft">
        {message}
      </p>
    </Modal>
  )
}
