function Star({ className }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path
        d="M32 4l7.2 18.4L58 30l-18.8 7.6L32 56l-7.2-18.4L6 30l18.8-7.6L32 4z"
        fill="#FCD34D"
      />
      <circle cx="32" cy="30" r="5" fill="#fff8e1" />
    </svg>
  )
}

function Cloud({ className }) {
  return (
    <svg viewBox="0 0 96 56" className={className} fill="none" aria-hidden="true">
      <path
        d="M24 46a14 14 0 01-1-28 20 20 0 0138-6 15 15 0 0113 34H24z"
        fill="#DDE4F7"
      />
    </svg>
  )
}

function Flower({ className }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="32"
          cy="17"
          rx="8"
          ry="13"
          fill="#F9B4B4"
          transform={`rotate(${angle} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="8" fill="#FCD34D" />
    </svg>
  )
}

function Rainbow({ className }) {
  return (
    <svg viewBox="0 0 96 56" className={className} fill="none" aria-hidden="true">
      <path d="M10 50a38 38 0 0176 0" stroke="#F87171" strokeWidth="7" />
      <path d="M20 50a28 28 0 0156 0" stroke="#FCD34D" strokeWidth="7" />
      <path d="M30 50a18 18 0 0136 0" stroke="#7FB0F2" strokeWidth="7" />
      <path d="M40 50a8 8 0 0116 0" stroke="#B4E36A" strokeWidth="7" />
    </svg>
  )
}

function Confetti({ className }) {
  return (
    <svg viewBox="0 0 72 72" className={className} fill="none" aria-hidden="true">
      <rect x="10" y="12" width="7" height="16" rx="3" fill="#C4B5FD" transform="rotate(-24 10 12)" />
      <rect x="44" y="6" width="7" height="14" rx="3" fill="#FCD34D" transform="rotate(18 44 6)" />
      <circle cx="58" cy="38" r="5" fill="#7FB0F2" />
      <rect x="18" y="46" width="7" height="14" rx="3" fill="#F9B4B4" transform="rotate(32 18 46)" />
      <circle cx="36" cy="26" r="4" fill="#B4E36A" />
    </svg>
  )
}

export function PageDecorations() {
  return (
    <div
      className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block"
      aria-hidden="true"
    >
      <Star className="absolute left-[3%] top-28 h-16 w-16 opacity-80" />
      <Cloud className="absolute right-[4%] top-24 h-14 w-24 opacity-80" />
      <Flower className="absolute right-[2%] top-[46%] h-20 w-20 opacity-70" />
      <Rainbow className="absolute left-[1%] top-[54%] h-16 w-28 opacity-70" />
      <Confetti className="absolute bottom-24 left-[6%] h-16 w-16 opacity-70" />
      <Star className="absolute bottom-32 right-[8%] h-10 w-10 opacity-50" />
    </div>
  )
}
