import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SleepLog } from '@/data/types'
import * as repo from '@/data/repo'
import { useSettings, useSettingsStore } from '@/app/settingsStore'
import { suggestTitration } from '@/lib/sleepMath'
import { formatDuration } from '@/lib/time'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const TITRATION_DELTA = 15
const TITRATION_MIN_MINUTES = 6 * 60
const TITRATION_MAX_MINUTES = 10 * 60
const TITRATION_COOLDOWN_DAYS = 7

function daysSince(isoDate: string | undefined): number {
  if (!isoDate) return Infinity
  return (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24)
}

/**
 * Self-contained card that appears when a titration suggestion is due.
 * Renders null when no invitation is active.
 */
export function SleepWindowInvitation() {
  const settings = useSettings()
  const patch = useSettingsStore((s) => s.patch)
  const [logs, setLogs] = useState<SleepLog[]>([])
  const [flashMsg, setFlashMsg] = useState<string | null>(null)

  useEffect(() => {
    void repo.listSleepLogs(30).then(setLogs)
  }, [])

  const titration = useMemo(
    () => suggestTitration(logs, settings.sleepWindowMinutes),
    [logs, settings.sleepWindowMinutes],
  )

  const show =
    titration !== null &&
    titration.action !== 'hold' &&
    daysSince(settings.titrationLastRespondedDate) >= TITRATION_COOLDOWN_DAYS

  const accept = useCallback(() => {
    if (!titration) return
    const newWindow =
      titration.action === 'shrink'
        ? Math.max(TITRATION_MIN_MINUTES, settings.sleepWindowMinutes - TITRATION_DELTA)
        : Math.min(TITRATION_MAX_MINUTES, settings.sleepWindowMinutes + TITRATION_DELTA)
    setFlashMsg(`Sleep window adjusted to ${formatDuration(newWindow)}`)
    void patch({
      sleepWindowMinutes: newWindow,
      titrationLastRespondedDate: new Date().toISOString(),
    })
    setTimeout(() => setFlashMsg(null), 4000)
  }, [titration, settings.sleepWindowMinutes, patch])

  const decline = useCallback(() => {
    void patch({ titrationLastRespondedDate: new Date().toISOString() })
  }, [patch])

  if (!show && !flashMsg) return null

  return (
    <>
      {flashMsg && (
        <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/25 px-4 py-3 text-sm text-emerald-400">
          {flashMsg}
        </div>
      )}
      {show && (
        <Card className="ring-1 ring-indigo-glow/30">
          <CardTitle>Sleep window invitation</CardTitle>
          <p className="text-sm text-lavender/70 mt-2 leading-relaxed">
            {titration!.message}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={accept}>
              Adjust by 15 min
            </Button>
            <Button size="sm" variant="ghost" onClick={decline}>
              Not now
            </Button>
          </div>
          <p className="text-xs text-lavender/40 mt-3">
            Current window {formatDuration(settings.sleepWindowMinutes)} · avg efficiency{' '}
            {titration!.averageEfficiency}% · offered at most once a week
          </p>
        </Card>
      )}
    </>
  )
}
