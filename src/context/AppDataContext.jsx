import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import { createInitialData, loadData, saveData, getLastLoadWarning } from '../services/storage'
import { verseReferenceKey } from '../lib/verseSchema'

const AppDataContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_VERSE':
      return { ...state, verses: [action.verse, ...state.verses] }

    case 'UPDATE_VERSE':
      return {
        ...state,
        verses: state.verses.map((verse) =>
          verse.id === action.id
            ? {
                ...verse,
                ...action.patch,
                updatedAt: new Date().toISOString(),
              }
            : verse,
        ),
      }

    case 'DELETE_VERSE':
      return {
        ...state,
        verses: state.verses.filter((verse) => verse.id !== action.id),
      }

    case 'MARK_LEARNED':
      return {
        ...state,
        verses: state.verses.map((verse) => {
          if (verse.id !== action.id || verse.progress.learned) return verse
          const now = new Date().toISOString()
          return {
            ...verse,
            progress: { ...verse.progress, learned: true, learnedAt: now },
            updatedAt: now,
          }
        }),
      }

    case 'MARK_REVIEWED':
      return {
        ...state,
        verses: state.verses.map((verse) => {
          if (verse.id !== action.id) return verse
          if (verse.progress.reviewModes.includes(action.mode)) return verse

          const now = new Date().toISOString()
          return {
            ...verse,
            progress: {
              ...verse.progress,
              learned: true,
              learnedAt: verse.progress.learnedAt ?? now,
              reviewModes: [...verse.progress.reviewModes, action.mode],
              reviewedAt: now,
            },
            updatedAt: now,
          }
        }),
      }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.patch },
      }

    case 'REPLACE_ALL':
      return { ...state, verses: action.verses }

    case 'RESET':
      return { ...createInitialData(), ready: true, storageWarning: null }

    case 'READY':
      return { ...state, ready: true }

    case 'CLEAR_WARNING':
      return { ...state, storageWarning: null }

    default:
      return state
  }
}

function init() {
  const data = loadData()
  return {
    ...data,
    ready: false,
    storageWarning: getLastLoadWarning(),
  }
}

export function AppDataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)

  useEffect(() => {
    dispatch({ type: 'READY' })
  }, [])

  useEffect(() => {
    if (!state.ready) return
    saveData({ settings: state.settings, verses: state.verses })
  }, [state.ready, state.settings, state.verses])

  const getVerse = useCallback(
    (id) => state.verses.find((verse) => verse.id === id),
    [state.verses],
  )

  const hasReference = useCallback(
    (reference, ignoreId = null) => {
      const key = `${reference?.bookId}:${reference?.chapter}:${reference?.verse}`
      return state.verses.some(
        (verse) => verse.id !== ignoreId && verseReferenceKey(verse) === key,
      )
    },
    [state.verses],
  )

  const addVerse = useCallback((verse) => {
    dispatch({ type: 'ADD_VERSE', verse })
    return verse
  }, [])

  const updateVerse = useCallback((id, patch) => {
    dispatch({ type: 'UPDATE_VERSE', id, patch })
  }, [])

  const deleteVerse = useCallback((id) => {
    dispatch({ type: 'DELETE_VERSE', id })
  }, [])

  const markLearned = useCallback((id) => {
    dispatch({ type: 'MARK_LEARNED', id })
  }, [])

  const markReviewed = useCallback((id, mode) => {
    dispatch({ type: 'MARK_REVIEWED', id, mode })
  }, [])

  const updateSettings = useCallback((patch) => {
    dispatch({ type: 'UPDATE_SETTINGS', patch })
  }, [])

  const replaceAll = useCallback((verses) => {
    dispatch({ type: 'REPLACE_ALL', verses })
  }, [])

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const clearStorageWarning = useCallback(() => {
    dispatch({ type: 'CLEAR_WARNING' })
  }, [])

  const value = useMemo(() => {
    const learnedCount = state.verses.filter(
      (verse) => verse.progress.learned,
    ).length
    const reviewedCount = state.verses.filter(
      (verse) => verse.progress.reviewModes.length > 0,
    ).length

    return {
      verses: state.verses,
      settings: state.settings,
      ready: state.ready,
      storageWarning: state.storageWarning,
      learnedCount,
      reviewedCount,
      getVerse,
      hasReference,
      addVerse,
      updateVerse,
      deleteVerse,
      markLearned,
      markReviewed,
      updateSettings,
      replaceAll,
      resetAll,
      clearStorageWarning,
    }
  }, [
    state,
    getVerse,
    hasReference,
    addVerse,
    updateVerse,
    deleteVerse,
    markLearned,
    markReviewed,
    updateSettings,
    replaceAll,
    resetAll,
    clearStorageWarning,
  ])

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  )
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('useAppData deve ser usado dentro de AppDataProvider.')
  }
  return context
}
