import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'

export function NotFoundPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    toast.info('Página não encontrada. Voltando ao início.')
    navigate('/', { replace: true })
  }, [navigate, toast])

  return null
}
