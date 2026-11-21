export const APP_NAME = 'Versículos em Emojis'
export const APP_ID = 'versiculos-em-emojis'
export const SCHEMA_VERSION = 1
export const STORAGE_KEY = 'vee:data:v1'

export const MIN_SEGMENTS = 3
export const MAX_LABEL_LENGTH = 24
export const MAX_GALLERY_EMOJIS = 3
export const QUIZ_MIN_VERSES = 3
export const QUIZ_MAX_OPTIONS = 4

/** Paleta fixa de cores dos trechos. Aplicada via style inline. */
export const SEGMENT_COLORS = [
  {
    id: 'coral',
    name: 'Coral',
    bg: '#F87171',
    soft: '#FDE4E4',
    chip: '#F9B4B4',
    ring: '#F87171',
  },
  {
    id: 'sky',
    name: 'Azul',
    bg: '#7FB0F2',
    soft: '#E5EEFD',
    chip: '#BBD4F8',
    ring: '#7FB0F2',
  },
  {
    id: 'amber',
    name: 'Amarelo',
    bg: '#FCD34D',
    soft: '#FEF3D1',
    chip: '#FDE38A',
    ring: '#FCD34D',
  },
  {
    id: 'lime',
    name: 'Verde',
    bg: '#B4E36A',
    soft: '#EEFAD9',
    chip: '#D4F0A0',
    ring: '#B4E36A',
  },
  {
    id: 'lilac',
    name: 'Lilás',
    bg: '#C4B5FD',
    soft: '#EDE9FE',
    chip: '#D9CFFE',
    ring: '#C4B5FD',
  },
]

export const SEGMENT_COLOR_BY_ID = Object.fromEntries(
  SEGMENT_COLORS.map((color) => [color.id, color]),
)

export function getSegmentColor(colorId) {
  return SEGMENT_COLOR_BY_ID[colorId] ?? SEGMENT_COLORS[0]
}

export function nextSegmentColor(index) {
  return SEGMENT_COLORS[index % SEGMENT_COLORS.length]
}

export const DEFAULT_SETTINGS = {
  translation: 'ARA',
  soundEnabled: true,
}
