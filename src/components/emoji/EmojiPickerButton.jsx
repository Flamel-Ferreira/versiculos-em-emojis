import { useRef, useState } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { SmilePlus } from 'lucide-react'
import { Emoji } from './Emoji'
import { Popover } from '../ui/Popover'
import { getSegmentColor } from '../../config/theme'
import { cn } from '../../lib/cn'

export function EmojiPickerButton({
  value,
  onChange,
  colorId = 'coral',
  size = 28,
  className,
}) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)
  const color = getSegmentColor(colorId)

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={value ? `Emoji selecionado: ${value}` : 'Escolher emoji'}
        className={cn(
          'flex h-12 min-w-12 items-center justify-center gap-2 rounded-2xl px-2.5 text-sm font-extrabold text-ink transition hover:brightness-105',
          className,
        )}
        style={{ backgroundColor: color.soft, boxShadow: `inset 0 0 0 1px ${color.chip}` }}
      >
        {value ? (
          <Emoji char={value} size={size} decorative />
        ) : (
          <>
            <SmilePlus className="h-5 w-5" style={{ color: color.bg }} />
            <span className="hidden sm:inline">Emoji</span>
          </>
        )}
      </button>

      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        width={352}
      >
        <div className="emoji-picker-wrapper overflow-hidden rounded-2xl">
          <Picker
            data={data}
            locale="pt"
            perLine={8}
            previewPosition="none"
            skinTonePosition="none"
            theme="light"
            onEmojiSelect={(emoji) => {
              onChange?.(emoji?.native ?? '')
              setOpen(false)
            }}
          />
        </div>
      </Popover>
    </>
  )
}
