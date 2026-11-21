import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SequenceSlots } from './SequenceSlots'
import { ShuffledPool } from './ShuffledPool'
import { Button } from '../ui/Button'
import { shuffleNotSolved } from '../../lib/shuffle'

export function OrganizeBoard({ verse, onSolved }) {
  const segmentIds = useMemo(
    () => verse.segments.map((segment) => segment.id),
    [verse.segments],
  )

  const [slots, setSlots] = useState(() => segmentIds.map(() => null))
  const [pool, setPool] = useState(() => shuffleNotSolved(segmentIds))
  const [feedback, setFeedback] = useState({})
  const [locked, setLocked] = useState(() => new Set())
  const wrongTimer = useRef(null)

  useEffect(
    () => () => {
      if (wrongTimer.current) clearTimeout(wrongTimer.current)
    },
    [],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  const allFilled = slots.every(Boolean)

  const reset = useCallback(() => {
    if (wrongTimer.current) clearTimeout(wrongTimer.current)
    setSlots(segmentIds.map(() => null))
    setPool(shuffleNotSolved(segmentIds))
    setFeedback({})
    setLocked(new Set())
  }, [segmentIds])

  const placeFromPool = useCallback(
    (segmentId, slotIndex) => {
      if (!segmentId) return
      const displaced = slots[slotIndex]

      setSlots((current) => {
        if (current[slotIndex] === segmentId) return current
        const next = [...current]
        next[slotIndex] = segmentId
        return next
      })

      setPool((current) => {
        const next = current.filter((id) => id !== segmentId)
        if (displaced && displaced !== segmentId && !next.includes(displaced)) {
          next.push(displaced)
        }
        return next
      })
    },
    [slots],
  )

  const swapSlots = useCallback((from, to) => {
    if (from === to) return
    setSlots((current) => {
      const next = [...current]
      ;[next[from], next[to]] = [next[to], next[from]]
      return next
    })
  }, [])

  const returnToPool = useCallback(
    (segmentId) => {
      const index = slots.indexOf(segmentId)
      if (index < 0 || locked.has(segmentId)) return

      setSlots((current) =>
        current.map((id, position) => (position === index ? null : id)),
      )
      setPool((current) =>
        current.includes(segmentId) ? current : [...current, segmentId],
      )
    },
    [slots, locked],
  )

  const handlePoolPick = useCallback(
    (segmentId) => {
      const emptyIndex = slots.findIndex((id) => !id)
      if (emptyIndex < 0) return
      placeFromPool(segmentId, emptyIndex)
    },
    [slots, placeFromPool],
  )

  const handleSlotClick = useCallback(
    (index) => {
      const segmentId = slots[index]
      if (segmentId) returnToPool(segmentId)
    },
    [slots, returnToPool],
  )

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      const source = active?.data?.current
      const target = over?.data?.current
      if (!source || !target) return

      if (source.type === 'pool' && target.type === 'slot') {
        placeFromPool(source.segmentId, target.index)
        return
      }

      if (source.type === 'slot' && target.type === 'slot') {
        swapSlots(source.index, target.index)
        return
      }

      if (source.type === 'slot' && target.type === 'pool') {
        returnToPool(source.segmentId)
      }
    },
    [placeFromPool, swapSlots, returnToPool],
  )

  const check = useCallback(() => {
    if (!allFilled) return

    const correct = new Set()
    const wrong = []
    const nextFeedback = {}

    slots.forEach((segmentId, index) => {
      const expected = verse.segments[index]?.id
      if (segmentId === expected) {
        correct.add(segmentId)
        nextFeedback[segmentId] = 'correct'
      } else if (segmentId) {
        wrong.push(segmentId)
        nextFeedback[segmentId] = 'wrong'
      }
    })

    setFeedback(nextFeedback)
    setLocked(correct)

    if (wrong.length === 0) {
      onSolved?.()
      return
    }

    setSlots((current) =>
      current.map((segmentId, index) =>
        segmentId && verse.segments[index]?.id === segmentId ? segmentId : null,
      ),
    )
    setPool((current) => [
      ...current.filter((id) => !wrong.includes(id)),
      ...wrong,
    ])

    if (wrongTimer.current) clearTimeout(wrongTimer.current)
    wrongTimer.current = setTimeout(() => {
      setFeedback((current) => {
        const next = { ...current }
        wrong.forEach((id) => delete next[id])
        return next
      })
    }, 2000)
  }, [allFilled, slots, verse.segments, onSolved])

  return (
    <div className="space-y-5">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SequenceSlots
          slots={slots}
          segments={verse.segments}
          feedback={feedback}
          locked={locked}
          onRemove={handleSlotClick}
          onReset={reset}
        />

        <div className="mt-5">
          <ShuffledPool
            items={pool}
            segments={verse.segments}
            feedback={feedback}
            onPick={handlePoolPick}
          />
        </div>
      </DndContext>

      <div className="flex justify-center">
        <Button
          variant="accent"
          size="lg"
          fullWidth
          disabled={!allFilled}
          onClick={check}
          iconLeft={<span aria-hidden="true">🚀</span>}
        >
          Conferir Ordem
        </Button>
      </div>
    </div>
  )
}
