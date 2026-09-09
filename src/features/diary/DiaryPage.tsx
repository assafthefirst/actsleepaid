import { useEffect, useRef, useState } from 'react'
import type { DiaryTag, SleepLog } from '@/data/types'
import * as repo from '@/data/repo'
import { useSettings } from '@/app/settingsStore'
import { computeMetrics } from '@/lib/sleepMath'
import { todayISODate, formatDuration, suggestLightsOutDate } from '@/lib/time'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { Sheet } from '@/components/ui/Sheet'
import { useLongPress } from '@/lib/useLongPress'
import { SleepWindowInvitation } from './SleepWindowInvitation'

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

function DiaryEntry({
  log,
  onEdit,
}: {
  log: SleepLog
  onEdit: (log: SleepLog) => void
}) {
  const m = computeMetrics(log)
  const longPress = useLongPress(() => onEdit(log))

  return (
    <Card {...longPress} className="select-none touch-manipulation">
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="font-medium">{log.date}</p>
          <p className="text-sm text-lavender/60 mt-1">
            {formatDuration(m.totalSleepMinutes)} asleep · SE {m.sleepEfficiency}%
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(log)
            }}
            className="text-lavender/35 hover:text-violet-soft text-xs px-1.5 py-0.5 rounded-lg transition"
            aria-label="Edit entry"
          >
            ✎
          </button>
          <p className="text-right text-sm text-lavender/50">
            Q {log.quality}/5
          </p>
          <p className="text-right text-sm text-lavender/50">
            Mood {log.mood}/5
          </p>
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
  )
}

export function DiaryPage() {
  const [logs, setLogs] = useState<SleepLog[]>([])
  const [open, setOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<SleepLog | null>(null)

  const reload = async () => {
    setLogs(await repo.listSleepLogs(30))
  }

  useEffect(() => {
    void reload()
  }, [])

  const openEdit = (log: SleepLog) => {
    setEditingLog(log)
    setOpen(true)
  }

  const closeSheet = () => {
    setOpen(false)
    setEditingLog(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Diary</h1>
          <p className="text-sm text-lavender/60 mt-1">
            Morning check-in builds your sleep window.
          </p>
        </div>
        <Button onClick={() => { setEditingLog(null); setOpen(true) }}>Log night</Button>
      </div>

      <SleepWindowInvitation />

      {logs.length === 0 ? (
        <Card>
          <p className="text-lavender/60 text-sm">
            No nights logged yet. After you wake, capture a quick check-in — five
            fields is enough.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {logs.map((log) => (
            <li key={log.id ?? log.date}>
              <DiaryEntry log={log} onEdit={openEdit} />
            </li>
          ))}
        </ul>
      )}

      <CheckInSheet
        key={editingLog?.id ?? 'new'}
        open={open}
        initialLog={editingLog ?? undefined}
        onClose={closeSheet}
        onSaved={() => {
          closeSheet()
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
  initialLog,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  initialLog?: SleepLog
}) {
  const settings = useSettings()
  const today = todayISODate()
  const defaultWake = new Date()
  defaultWake.setHours(7, 0, 0, 0)

  const [date, setDate] = useState(initialLog?.date ?? today)
  const [lightsOut, setLightsOut] = useState(
    initialLog
      ? toLocalInput(initialLog.lightsOutISO)
      : toLocalInput(suggestLightsOutDate(today, settings.bedtimeMinutes).toISOString()),
  )
  // Tracks whether the user has touched the field, so the async refinement
  // below (using the last logged bedtime hour) never clobbers their input.
  const lightsOutTouched = useRef(false)
  const [finalWake, setFinalWake] = useState(
    initialLog ? toLocalInput(initialLog.finalWakeISO) : toLocalInput(defaultWake.toISOString()),
  )
  const [outOfBed, setOutOfBed] = useState(
    initialLog ? toLocalInput(initialLog.outOfBedISO) : toLocalInput(defaultWake.toISOString()),
  )
  const [latency, setLatency] = useState(initialLog?.latencyMinutes ?? 15)
  const [awakenings, setAwakenings] = useState(initialLog?.awakenings ?? 1)
  const [awakeningMinutes, setAwakeningMinutes] = useState(initialLog?.awakeningMinutes ?? 10)
  const [quality, setQuality] = useState(initialLog?.quality ?? 3)
  const [mood, setMood] = useState(initialLog?.mood ?? 3)
  const [tags, setTags] = useState<DiaryTag[]>(initialLog?.tags ?? [])
  const [notes, setNotes] = useState(initialLog?.notes ?? '')
  const [saving, setSaving] = useState(false)

  // For a brand-new entry, suggest "lights out" using the hour of the most
  // recently logged night (falls back to the settings bedtime set above if
  // there's no history yet).
  useEffect(() => {
    if (initialLog) return
    void repo.listSleepLogs(1).then(([recent]) => {
      if (!recent || lightsOutTouched.current) return
      const recentTime = new Date(recent.lightsOutISO)
      const minutesOfDay = recentTime.getHours() * 60 + recentTime.getMinutes()
      setLightsOut(toLocalInput(suggestLightsOutDate(date, minutesOfDay).toISOString()))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleTag = (t: DiaryTag) => {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  const save = async () => {
    setSaving(true)
    try {
      await repo.upsertSleepLog({
        id: initialLog?.id,
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

  const isEditing = !!initialLog

  return (
    <Sheet open={open} onClose={onClose} title={isEditing ? 'Edit check-in' : 'Morning check-in'}>
      <div className="space-y-4">
        {isEditing ? (
          <p className="text-sm text-lavender/50">
            Editing entry for <span className="text-violet-soft">{date}</span>
          </p>
        ) : (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-lavender/70">Date (morning)</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-night-700 border border-night-500/50 rounded-2xl px-4 py-3"
            />
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-lavender/70">Lights out</span>
          <input
            type="datetime-local"
            value={lightsOut}
            onChange={(e) => {
              lightsOutTouched.current = true
              setLightsOut(e.target.value)
            }}
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
            onChange={(e) => {
              setFinalWake(e.target.value)
              setOutOfBed(e.target.value)
            }}
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
          {saving ? 'Saving…' : isEditing ? 'Update night' : 'Save night'}
        </Button>
      </div>
    </Sheet>
  )
}
