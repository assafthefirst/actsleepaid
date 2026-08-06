import { useEffect, useMemo, useState } from 'react'
import type { SleepLog } from '@/data/types'
import * as repo from '@/data/repo'
import { bedtimeConsistencyStdDev, computeMetrics } from '@/lib/sleepMath'
import { Card, CardTitle } from '@/components/ui/Card'
import { BarChart, LineChart } from '@/components/ui/Charts'

export function InsightsPage() {
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

  const avgSe =
    recent.length > 0
      ? recent.reduce((s, l) => s + computeMetrics(l).sleepEfficiency, 0) / recent.length
      : null

  const avgPostWake =
    recent.length > 0
      ? recent.reduce((s, l) => {
          const loungeMs = new Date(l.outOfBedISO).getTime() - new Date(l.finalWakeISO).getTime()
          return s + Math.max(0, loungeMs / 60000)
        }, 0) / recent.length
      : null

  const postWakeGood = avgPostWake != null && avgPostWake <= 30
  const consistencyGood = consistency != null && consistency < 20

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
            {/* Avg sleep efficiency */}
            <Card>
              <CardTitle>Avg efficiency</CardTitle>
              <p className="text-2xl font-semibold mt-2 tabular-nums">
                {avgSe != null ? `${avgSe.toFixed(0)}%` : '—'}
              </p>
              <p className="text-[11px] text-lavender/40 mt-1">
                Time asleep ÷ time in bed
              </p>
            </Card>

            {/* Avg post-wake time in bed */}
            <Card>
              <CardTitle>Avg lie-in after waking</CardTitle>
              <p
                className={`text-2xl font-semibold mt-2 tabular-nums ${
                  avgPostWake == null
                    ? ''
                    : postWakeGood
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                }`}
              >
                {avgPostWake != null ? `${Math.round(avgPostWake)}m` : '—'}
              </p>
              <p className="text-[11px] text-lavender/40 mt-1">
                {postWakeGood
                  ? 'Under 30 min — healthy'
                  : avgPostWake != null
                    ? 'Over 30 min — try rising closer to wake time'
                    : 'Time from final wake to out of bed'}
              </p>
            </Card>

            {/* Bedtime consistency */}
            <Card className="col-span-2">
              <CardTitle>Bedtime consistency</CardTitle>
              <p
                className={`text-2xl font-semibold mt-2 tabular-nums ${
                  consistency == null
                    ? ''
                    : consistencyGood
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                }`}
              >
                {consistency == null ? '—' : `±${consistency}m`}
              </p>
              <p className="text-[11px] text-lavender/40 mt-1">
                {consistencyGood
                  ? 'Under ±20 min — consistent rhythm'
                  : consistency != null
                    ? 'Over ±20 min — irregular schedule can weaken sleep drive'
                    : 'Variation in lights-out time across nights'}
              </p>
            </Card>
          </div>

          {/* Sleep duration chart */}
          <Card>
            <CardTitle>Sleep duration</CardTitle>
            <p className="text-xs text-lavender/45 mt-0.5">
              Hours of sleep per night · oldest on the left, most recent on the right
            </p>
            <div className="mt-3">
              <BarChart
                data={durationBars}
                formatValue={(v) => `${v.toFixed(1)}h`}
              />
            </div>
          </Card>

          {/* Sleep efficiency trend */}
          <Card>
            <CardTitle>Sleep efficiency trend</CardTitle>
            <div className="mt-3">
              <LineChart
                data={efficiencyLine}
                average={avgSe ?? undefined}
                avgLabel={avgSe != null ? `avg ${avgSe.toFixed(0)}%` : undefined}
              />
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
