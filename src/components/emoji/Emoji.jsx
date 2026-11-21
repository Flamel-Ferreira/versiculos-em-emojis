import { useEffect, useMemo, useState } from 'react'
import { cn } from '../../lib/cn'

const CDN_BASE =
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64'

function toCodePoints(char) {
  return [...char]
    .map((symbol) => symbol.codePointAt(0).toString(16))
    .join('-')
}

function buildCandidates(char) {
  const base = toCodePoints(char)
  const withoutVariation = base.replace(/-fe0f/g, '')
  const candidates = [base]

  if (withoutVariation && withoutVariation !== base) {
    candidates.push(withoutVariation)
  }

  return candidates
}

export function Emoji({ char, size = 32, className, decorative = true }) {
  const candidates = useMemo(() => buildCandidates(char ?? ''), [char])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [char])

  if (!char) return null

  const useNative = index >= candidates.length

  if (useNative) {
    return (
      <span
        className={cn('inline-block select-none leading-none', className)}
        style={{ fontSize: size, width: size, height: size, lineHeight: 1 }}
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : char}
        aria-hidden={decorative ? 'true' : undefined}
      >
        {char}
      </span>
    )
  }

  return (
    <img
      src={`${CDN_BASE}/${candidates[index]}.png`}
      alt={decorative ? '' : char}
      aria-hidden={decorative ? 'true' : undefined}
      width={size}
      height={size}
      loading="lazy"
      draggable={false}
      onError={() => setIndex((value) => value + 1)}
      className={cn('inline-block select-none align-middle', className)}
      style={{ width: size, height: size }}
    />
  )
}
