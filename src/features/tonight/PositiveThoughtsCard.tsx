import { useEffect, useMemo, useState } from 'react'
import * as repo from '@/data/repo'
import { useSettings, useSettingsStore } from '@/app/settingsStore'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DEFAULT_POSITIVE_THOUGHTS, sampleThoughts } from './positiveThoughts'

const SHOWN = 3

export function PositiveThoughtsCard() {
  const settings = useSettings()
  const patch = useSettingsStore((s) => s.patch)
  const [savedResponses, setSavedResponses] = useState<string[]>([])
  const [shuffleKey, setShuffleKey] = useState(0)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    void repo.listThoughtLogs(50).then((logs) => {
      const responses = logs
        .map((l) => l.workableResponse?.trim())
        .filter((v): v is string => !!v)
      setSavedResponses(responses)
    })
  }, [])

  const pool = useMemo(
    () => [...settings.customPositiveThoughts, ...savedResponses, ...DEFAULT_POSITIVE_THOUGHTS],
    [settings.customPositiveThoughts, savedResponses],
  )

  // shuffleKey forces a fresh sample from the same pool when the user taps Shuffle.
  const shown = useMemo(() => sampleThoughts(pool, SHOWN), [pool, shuffleKey])

  const addCustom = async () => {
    const text = draft.trim()
    if (!text) return
    await patch({ customPositiveThoughts: [...settings.customPositiveThoughts, text] })
    setDraft('')
    setAdding(false)
    setShuffleKey((k) => k + 1)
  }

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
        Grounded thoughts to borrow if useful — from your saved responses plus a few
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

      {adding ? (
        <div className="mt-4 flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder="Write one that feels true to you"
            className="bg-night-700 border border-night-500/50 rounded-2xl px-4 py-3 text-sm resize-none"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => void addCustom()} disabled={!draft.trim()}>
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false)
                setDraft('')
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="ghost" className="mt-3" onClick={() => setAdding(true)}>
          + Add your own
        </Button>
      )}
    </Card>
  )
}
