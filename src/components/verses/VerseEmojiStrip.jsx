import { Emoji } from '../emoji/Emoji'
import { MAX_GALLERY_EMOJIS } from '../../config/theme'

export function VerseEmojiStrip({ segments = [], max = MAX_GALLERY_EMOJIS }) {
  const visible = segments.slice(0, max)
  const remaining = Math.max(0, segments.length - max)

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-3xl bg-surface-muted px-3 py-2.5">
      {visible.map((segment) => (
        <span key={segment.id} className="flex items-center justify-center">
          <Emoji char={segment.emoji} size={38} decorative />
        </span>
      ))}
      {remaining > 0 ? (
        <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-surface-strong px-2 text-sm font-black text-ink-soft">
          +{remaining}
        </span>
      ) : null}
    </div>
  )
}
