import { useEffect, useMemo, useState } from 'react'
import type { SleepLog } from '@/data/types'
import * as repo from '@/data/repo'
import { useSettings } from '@/app/settingsStore'
import {
  bedtimeConsistencyStdDev,
  computeMetrics,
  rollingSleepDebt,
} from '@/lib/sleepMath'
import { formatDuration } from '@/lib/time'
import { Card, CardTitle } from '@/components/ui/Card'
import { BarChart, LineChart } from '@/components/ui/Charts'

export function InsightsPage() {
  const settings = useSettings()
  const [logs, setLogs] = useState<SleepLog[]>([])

  useEffect(() => {
    void repo.listSleepLogs(30).then(setLogs)
  }, [])

  const recent = logs.slice(0, 14).reverse()

  const durationBars = useMemo(
    () =>
      recent.map((l) => ({
        label: l.date.slice(8),
        value: computeMetrics(l).totalSleepMinutes / 60,
      })),
    [recent],
  )

  const efficiencyLine = useMemo(
    () =>
      recent.map((l) => ({
        label: l.date.slice(8),
        value: computeMetrics(l).sleepEfficiency,
      })),
    [recent],
  )

  const consistency = bedtimeConsistencyStdDev(logs.slice(0, 14))
  const debt = rollingSleepDebt(logs, settings.targetSleepMinutes, 14)

  const avgSe =
    recent.length > 0
      ? recent.reduce((s, l) => s + computeMetrics(l).sleepEfficiency, 0) /
        recent.length
      : null

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Insights</h1>
        <p className="text-sm text-lavender/60 mt-1">
          Last {Math.min(14, logs.length)} nights — patterns, not judgments.
        </p>
      </div>

      {logs.length === 0 ? (
        <Card>
          <p className="text-sm text-lavender/60">
            Log a few mornings in Diary to unlock charts and sleep-window suggestions.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardTitle>Avg efficiency</CardTitle>
              <p className="text-2xl font-semibold mt-2 tabular-nums">
                {avgSe?.toFixed(0)}%
              </p>
            </Card>
            <Card>
              <CardTitle>Sleep debt</CardTitle>
              <p className="text-2xl font-semibold mt-2 tabular-nums">
                {debt > 0 ? formatDuration(debt) : '0m'}
              </p>
              <p className="text-[11px] text-lavender/40 mt-1">vs target · 14d</p>
            </Card>
            <Card className="col-span-2">
              <CardTitle>Bedtime consistency</CardTitle>
              <p className="text-2xl font-semibold mt-2 tabular-nums">
                {consistency == null ? '—' : `±${consistency}m`}
              </p>
              <p className="text-[11px] text-lavender/40 mt-1">
                Std. deviation of lights-out time
              </p>
            </Card>
          </div>

          <Card>
            <CardTitle>Sleep duration (hours)</CardTitle>
            <div className="mt-3">
              <BarChart data={durationBars} unit="hours" />
            </div>
          </Card>

          <Card>
            <CardTitle>Sleep efficiency trend</CardTitle>
            <div className="mt-3">
              <LineChart data={efficiencyLine} />
            </div>
            <p className="text-xs text-lavender/40 mt-2">
              ≥85% is generally considered solid. Titration lives in Diary.
            </p>
          </Card>
        </>
      )}
    </div>
  )
}
