import { Fragment } from 'react'
import { Emoji } from '../emoji/Emoji'
import { getSegmentColor } from '../../config/theme'
import { cn } from '../../lib/cn'

export function VerseRenderer({
  verse,
  hiddenSegmentIds,
  showQuotes = true,
  size = 'lg',
}) {
  if (!verse?.tokens?.length) return null

  const hidden = hiddenSegmentIds ?? new Set()
  const segmentStarts = new Map(
    verse.segments.map((segment) => [segment.startToken, segment]),
  )

  const nodes = []
  let index = 0

  while (index < verse.tokens.length) {
    const segment = segmentStarts.get(index)

    if (segment) {
      const isHidden = hidden.has(segment.id)
      const color = getSegmentColor(segment.colorId)
      nodes.push(
        <span
          key={`segment-${segment.id}`}
          className={cn(
            'mx-0.5 inline-flex items-center gap-1.5 rounded-xl px-2 py-0.5 align-baseline',
            isHidden && 'select-none',
          )}
          style={{ backgroundColor: color.soft }}
        >
          <Emoji char={segment.emoji} size={size === 'lg' ? 26 : 20} decorative />
          <span
            className={cn(isHidden && 'tracking-[0.18em] text-ink-soft')}
            aria-label={isHidden ? 'Trecho oculto' : undefined}
          >
            {isHidden ? '•••••' : segment.text}
          </span>
        </span>,
      )
      index = segment.endToken + 1
    } else {
      const token = verse.tokens[index]
      nodes.push(
        <Fragment key={`token-${index}`}>
          <span>{token}</span>
        </Fragment>,
      )
      index += 1
    }

    if (index < verse.tokens.length) nodes.push(' ')
  }

  return (
    <p
      className={cn(
        'font-bold text-ink',
        size === 'lg'
          ? 'text-2xl leading-[1.55] sm:text-[1.7rem]'
          : 'text-lg leading-relaxed',
      )}
    >
      {showQuotes ? <span className="text-ink-soft">“</span> : null}
      {nodes}
      {showQuotes ? <span className="text-ink-soft">”</span> : null}
    </p>
  )
}
