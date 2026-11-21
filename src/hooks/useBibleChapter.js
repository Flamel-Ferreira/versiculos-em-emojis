import { useCallback, useEffect, useState } from 'react'
import { fetchChapter, getApiErrorMessage } from '../services/bibleApi'

export function useBibleChapter(bookId, chapter) {
  const [state, setState] = useState({
    verses: [],
    loading: false,
    error: null,
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!bookId || !chapter) {
      setState({ verses: [], loading: false, error: null })
      return undefined
    }

    let active = true
    setState((current) => ({ ...current, loading: true, error: null }))

    fetchChapter(bookId, chapter)
      .then((verses) => {
        if (!active) return
        setState({ verses, loading: false, error: null })
      })
      .catch((error) => {
        if (!active) return
        setState({
          verses: [],
          loading: false,
          error: getApiErrorMessage(error),
        })
      })

    return () => {
      active = false
    }
  }, [bookId, chapter, attempt])

  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  return { ...state, retry }
}
