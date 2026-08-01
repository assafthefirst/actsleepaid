import { useEffect, useMemo, useState } from 'react'
import type { DiaryTag, SleepLog } from '@/data/types'
import * as repo from '@/data/repo'
import { useSettings, useSettingsStore } from '@/app/settingsStore'
import { computeMetrics, suggestTitration } from '@/lib/sleepMath'
import { todayISODate, formatDuration } from '@/lib/time'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { Sheet } from '@/components/ui/Sheet'

const TAGS: { id: DiaryTag; label: string }[] = [
  { id: 'caffeine', label: 'Caffeine' },
  { id: 'alcohol', label: 'Alcohol' },
  { id: 'exercise', label: 'Exercise' },
  { id: 'screens', label: 'Late screens' },
  { id: 'stress', label: 'Stress' },
  { id: 'nap', label: 'Nap' },
  { id: 'travel', label: 'Travel' },
]

function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInput(v: string): string {
  return new Date(v).toISOString()
}

export function DiaryPage() {
  const settings = useSettings()
  const patch = useSettingsStore((s) => s.patch)
  const [logs, setLogs] = useState<SleepLog[]>([])
  const [open, setOpen] = useState(false)

  const reload = async () => {
    setLogs(await repo.listSleepLogs(30))
  }

  useEffect(() => {
    void reload()
  }, [])

  const titration = useMemo(
    () => suggestTitration(logs, settings.sleepWindowMinutes),
    [logs, settings.sleepWindowMinutes],
  )

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Diary</h1>
          <p className="text-sm text-lavender/60 mt-1">
            Morning check-in builds your sleep window.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Log night</Button>
      </div>

      {titration && (
        <Card className="border-indigo-glow/30">
          <CardTitle>Sleep window invitation</CardTitle>
          <p className="text-sm text-lavender/70 mt-2 leading-relaxed">
            {titration.message}
          </p>
          {titration.action !== 'hold' && titration.deltaMinutes > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => {
                  const next =
                    titration.action === 'shrink'
                      ? settings.sleepWindowMinutes - titration.deltaMinutes
                      : settings.sleepWindowMinutes + titration.deltaMinutes
                  void patch({ sleepWindowMinutes: next })
                }}
              >
                Accept ({titration.action} {titration.deltaMinutes}m)
              </Button>
              <Button size="sm" variant="ghost">
                Not now
              </Button>
            </div>
          )}
          <p className="text-xs text-lavender/40 mt-3">
            Current window {formatDuration(settings.sleepWindowMinutes)} · avg
            efficiency {titration.averageEfficiency}%
          </p>
        </Card>
      )}

      {logs.length === 0 ? (
        <Card>
          <p className="text-lavender/60 text-sm">
            No nights logged yet. After you wake, capture a quick check-in — five
            fields is enough.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {logs.map((log) => {
            const m = computeMetrics(log)
            return (
              <li key={log.id ?? log.date}>
                <Card>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{log.date}</p>
                      <p className="text-sm text-lavender/60 mt-1">
                        {formatDuration(m.totalSleepMinutes)} asleep · SE{' '}
                        {m.sleepEfficiency}%
                      </p>
                    </div>
                    <div className="text-right text-sm text-lavender/50">
                      <p>Q {log.quality}/5</p>
                      <p>Mood {log.mood}/5</p>
                    </div>
                  </div>
                  {log.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {log.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-night-700 text-lavender/70"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </li>
            )
          })}
        </ul>
      )}

      <CheckInSheet
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => {
          setOpen(false)
          void reload()
        }}
      />
    </div>
  )
}

function CheckInSheet({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const today = todayISODate()
  const defaultLights = new Date()
  defaultLights.setDate(defaultLights.getDate() - 1)
  defaultLights.setHours(23, 0, 0, 0)
  const defaultWake = new Date()
  defaultWake.setHours(7, 0, 0, 0)

  const [date, setDate] = useState(today)
  const [lightsOut, setLightsOut] = useState(toLocalInput(defaultLights.toISOString()))
  const [finalWake, setFinalWake] = useState(toLocalInput(defaultWake.toISOString()))
  const [outOfBed, setOutOfBed] = useState(toLocalInput(defaultWake.toISOString()))
  const [latency, setLatency] = useState(15)
  const [awakenings, setAwakenings] = useState(1)
  const [awakeningMinutes, setAwakeningMinutes] = useState(10)
  const [quality, setQuality] = useState(3)
  const [mood, setMood] = useState(3)
  const [tags, setTags] = useState<DiaryTag[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const toggleTag = (t: DiaryTag) => {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  const save = async () => {
    setSaving(true)
    try {
      await repo.upsertSleepLog({
        date,
        lightsOutISO: fromLocalInput(lightsOut),
        finalWakeISO: fromLocalInput(finalWake),
        outOfBedISO: fromLocalInput(outOfBed),
        latencyMinutes: latency,
        awakenings,
        awakeningMinutes,
        quality,
        mood,
        tags,
        notes: notes || undefined,
      })
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Morning check-in">
      <div className="space-y-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-lavender/70">Date (morning)</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-night-700 border border-night-500/50 rounded-2xl px-4 py-3"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-lavender/70">Lights out</span>
          <input
            type="datetime-local"
            value={lightsOut}
            onChange={(e) => setLightsOut(e.target.value)}
            className="bg-night-700 border border-night-500/50 rounded-2xl px-4 py-3"
          />
        </label>
        <Slider
          label="Minutes to fall asleep"
          value={latency}
          min={0}
          max={120}
          step={5}
          onChange={setLatency}
          display={`${latency}m`}
        />
        <Slider
          label="Awakenings"
          value={awakenings}
          min={0}
          max={10}
          onChange={setAwakenings}
          display={String(awakenings)}
        />
        <Slider
          label="Time awake during night"
          value={awakeningMinutes}
          min={0}
          max={180}
          step={5}
          onChange={setAwakeningMinutes}
          display={`${awakeningMinutes}m`}
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-lavender/70">Final wake</span>
          <input
            type="datetime-local"
            value={finalWake}
            onChange={(e) => setFinalWake(e.target.value)}
            className="bg-night-700 border border-night-500/50 rounded-2xl px-4 py-3"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-lavender/70">Out of bed</span>
          <input
            type="datetime-local"
            value={outOfBed}
            onChange={(e) => setOutOfBed(e.target.value)}
            className="bg-night-700 border border-night-500/50 rounded-2xl px-4 py-3"
          />
        </label>
        <Slider
          label="Sleep quality"
          value={quality}
          min={1}
          max={5}
          onChange={setQuality}
          display={`${quality}/5`}
        />
        <Slider
          label="Morning mood"
          value={mood}
          min={1}
          max={5}
          onChange={setMood}
          display={`${mood}/5`}
        />
        <div>
          <p className="text-sm text-lavender/70 mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  tags.includes(t.id)
                    ? 'bg-indigo-glow/30 border-indigo-glow text-mist'
                    : 'border-night-500 text-lavender/70'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-lavender/70">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="bg-night-700 border border-night-500/50 rounded-2xl px-4 py-3 resize-none"
          />
        </label>
        <Button className="w-full" onClick={() => void save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save night'}
        </Button>
      </div>
    </Sheet>
  )
}
