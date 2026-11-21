import { QUIZ_MAX_OPTIONS, QUIZ_MIN_VERSES } from '../config/theme'
import { shuffle } from './shuffle'

export const OPTION_LETTERS = ['A', 'B', 'C', 'D']

/**
 * Monta as opções do Quiz (SPEC 10.6 / P3 / P24).
 *
 * - Exige pelo menos 3 versículos.
 * - Total de opções = min(4, total).
 * - Distratores = exatamente min(4, total) - 1, sorteados.
 * - Sempre embaralhado; as letras são atribuídas após o embaralhamento.
 */
export function buildQuizOptions(target, verses = []) {
  if (!target || !Array.isArray(verses) || verses.length < QUIZ_MIN_VERSES) {
    return []
  }

  const total = verses.length
  const optionCount = Math.min(QUIZ_MAX_OPTIONS, total)
  const distractorCount = optionCount - 1

  const others = verses.filter((verse) => verse.id !== target.id)
  const distractors = shuffle(others).slice(0, distractorCount)

  return shuffle([target, ...distractors]).map((verse, index) => ({
    verseId: verse.id,
    referenceLabel: verse.referenceLabel,
    text: verse.fullText,
    letter: OPTION_LETTERS[index] ?? String(index + 1),
  }))
}

export function getQuizOptionCount(total) {
  return Math.min(QUIZ_MAX_OPTIONS, Math.max(0, total))
}
