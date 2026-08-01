import { useEffect, useState } from 'react'
import type { ThoughtLog, ThoughtPattern } from '@/data/types'
import * as repo from '@/data/repo'
import { useSettings } from '@/app/settingsStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { Sheet } from '@/components/ui/Sheet'

const PATTERNS: { value: ThoughtPattern; label: string }[] = [
  { value: 'catastrophizing', label: 'Catastrophizing' },
  { value: 'sleep_effort', label: 'Sleep effort' },
  { value: 'clock_watching', label: 'Clock-watching' },
  { value: 'self_judgment', label: 'Self-judgment' },
  { value: 'reason_giving', label: 'Reason-giving' },
  { value: 'other', label: 'Other' },
]

export function ThoughtsPage() {
  const settings = useSettings()
  const [logs, setLogs] = useState<ThoughtLog[]>([])
  const [composerOpen, setComposerOpen] = useState(false)

  const reload = async () => setLogs(await repo.listThoughtLogs(50))

  useEffect(() => {
    void reload()
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Thoughts</h1>
        <p className="text-sm text-lavender/60 mt-1">
          Notice · name · unhook · act on values. Not “replace the thought.”
        </p>
      </div>

      <Button onClick={() => setComposerOpen(true)}>Log a thought</Button>
      {logs.length === 0 ? (
        <Card>
          <p className="text-sm text-lavender/60">
            When a sticky sleep thought shows up, capture it in defused language.
            Willingness matters more than “believing a better thought.” Looking for
            guided practices? Try the Exercises tab.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {logs.map((l) => (
            <li key={l.id}>
              <Card>
                <p className="text-xs text-lavender/45">
                  {new Date(l.createdAt).toLocaleString()} · {l.pattern}
                </p>
                <p className="mt-2 text-sm italic text-violet-soft">
                  {l.defused || `I’m having the thought that ${l.thought}`}
                </p>
                <p className="text-sm text-lavender/70 mt-2">
                  Willingness {l.willingness}/10
                </p>
                {l.committedAction && (
                  <p className="text-sm mt-1">
                    <span className="text-lavender/50">Action: </span>
                    {l.committedAction}
                  </p>
                )}
                {l.workableResponse && (
                  <p className="text-xs text-lavender/45 mt-2">
                    Workable response (not a replacement): {l.workableResponse}
                  </p>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}

      <ThoughtComposer
        open={composerOpen}
        values={settings.values}
        onClose={() => setComposerOpen(false)}
        onSaved={() => {
          setComposerOpen(false)
          void reload()
        }}
      />
    </div>
  )
}

function ThoughtComposer({
  open,
  onClose,
  onSaved,
  values,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  values: string[]
}) {
  const [thought, setThought] = useState('')
  const [pattern, setPattern] = useState<ThoughtPattern>('sleep_effort')
  const [willingness, setWillingness] = useState(5)
  const [value, setValue] = useState(values[0] ?? '')
  const [action, setAction] = useState('')
  const [workable, setWorkable] = useState('')
  const [saving, setSaving] = useState(false)

  const defused = thought
    ? `I’m having the thought that ${thought.replace(/^i['’]m having the thought that\s*/i, '')}`
    : ''

  const save = async () => {
    if (!thought.trim()) return
    setSaving(true)
    try {
      await repo.addThoughtLog({
        thought: thought.trim(),
        defused,
        pattern,
        willingness,
        value: value || undefined,
        committedAction: action || undefined,
        workableResponse: workable || undefined,
      })
      setThought('')
      setAction('')
      setWorkable('')
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Notice & unhook">
      <div className="space-y-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-lavender/70">What showed up?</span>
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            rows={3}
            placeholder="e.g. I’ll be useless tomorrow if I don’t sleep"
            className="bg-night-700 border border-night-500/50 rounded-2xl px-4 py-3 resize-none"
          />
        </label>
        {defused && (
          <p className="text-sm italic text-violet-soft bg-night-700/40 rounded-2xl px-4 py-3">
            {defused}
          </p>
        )}
        <div>
          <p className="text-sm text-lavender/70 mb-2">Pattern</p>
          <div className="flex flex-wrap gap-2">
            {PATTERNS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPattern(p.value)}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  pattern === p.value
                    ? 'bg-indigo-glow/30 border-indigo-glow'
                    : 'border-night-500 text-lavender/70'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <Slider
          label="Willingness to have this thought without struggling"
          value={willingness}
          min={0}
          max={10}
          onChange={setWillingness}
          display={`${willingness}/10`}
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-lavender/70">Related value</span>
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-night-700 border border-night-500/50 rounded-2xl px-4 py-3"
          >
            {values.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-lavender/70">Committed action (tiny is fine)</span>
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="e.g. get a glass of water, drop anchor for 40s"
            className="bg-night-700 border border-night-500/50 rounded-2xl px-4 py-3"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-lavender/70">
            Optional workable response{' '}
            <span className="text-lavender/40">(not a replacement)</span>
          </span>
          <input
            value={workable}
            onChange={(e) => setWorkable(e.target.value)}
            placeholder="Something you can do or say that helps you unhook"
            className="bg-night-700 border border-night-500/50 rounded-2xl px-4 py-3"
          />
        </label>
        <Button className="w-full" disabled={saving || !thought.trim()} onClick={() => void save()}>
          Save
        </Button>
      </div>
    </Sheet>
  )
}
