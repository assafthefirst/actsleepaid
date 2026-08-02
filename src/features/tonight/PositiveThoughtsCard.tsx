import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import * as repo from '@/data/repo'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DEFAULT_POSITIVE_THOUGHTS, derivePositiveThought, sampleThoughts } from './positiveThoughts'

const SHOWN = 2

export function PositiveThoughtsCard() {
  const [loggedThoughts, setLoggedThoughts] = useState<string[]>([])
  const [shuffleKey, setShuffleKey] = useState(0)

  useEffect(() => {
    void repo.listThoughtLogs(50).then((logs) => {
      const derived = logs
        .map(derivePositiveThought)
        .filter((v): v is string => !!v)
      setLoggedThoughts(derived)
    })
  }, [])

  const pool = useMemo(
    () => [...loggedThoughts, ...DEFAULT_POSITIVE_THOUGHTS],
    [loggedThoughts],
  )

  // shuffleKey forces a fresh sample from the same pool when the user taps Shuffle.
  const shown = useMemo(() => sampleThoughts(pool, SHOWN), [pool, shuffleKey])

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>Helpful thoughts</CardTitle>
        <button
          type="button"
          onClick={() => setShuffleKey((k) => k + 1)}
          className="text-xs text-violet-soft hover:text-mist transition"
        >
          Shuffle
        </button>
      </div>
      <p className="text-xs text-lavender/45 mt-1">
        Grounded thoughts to borrow if useful — from what you've logged plus a few
        common ones. Nothing here is required.
      </p>

      <ul className="mt-4 space-y-2">
        {shown.map((t) => (
          <li
            key={t}
            className="text-sm text-mist/90 bg-night-700/40 rounded-2xl px-4 py-3 leading-relaxed"
          >
            “{t}”
          </li>
        ))}
      </ul>

      <Link to="/thoughts">
        <Button size="sm" variant="ghost" className="mt-3">
          + Add your own
        </Button>
      </Link>
    </Card>
  )
}
