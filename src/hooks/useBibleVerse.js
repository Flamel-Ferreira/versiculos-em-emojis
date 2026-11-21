import { useCallback, useEffect, useState } from 'react'
import { fetchVerse, getApiErrorMessage } from '../services/bibleApi'
import { tokenize } from '../lib/tokenize'

export function useBibleVerse(bookId, chapter, verse) {
  const [state, setState] = useState({
    text: '',
    tokens: [],
    loading: false,
    error: null,
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!bookId || !chapter || !verse) {
      setState({ text: '', tokens: [], loading: false, error: null })
      return undefined
    }

    let active = true
    setState({ text: '', tokens: [], loading: true, error: null })

    fetchVerse(bookId, chapter, verse)
      .then((text) => {
        if (!active) return
        setState({
          text,
          tokens: tokenize(text).tokens,
          loading: false,
          error: null,
        })
      })
      .catch((error) => {
        if (!active) return
        setState({
          text: '',
          tokens: [],
          loading: false,
          error: getApiErrorMessage(error),
        })
      })

    return () => {
      active = false
    }
  }, [bookId, chapter, verse, attempt])

  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  return { ...state, retry }
}
