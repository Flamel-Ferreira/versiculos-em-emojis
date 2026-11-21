import { KeyRound } from 'lucide-react'

export function KeywordCounter({ count = 0 }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-sm font-extrabold text-[#8a5a00]">
      <KeyRound className="h-4 w-4" />
      {count} {count === 1 ? 'palavra-chave ativa' : 'palavras-chave ativas'}
    </span>
  )
}
