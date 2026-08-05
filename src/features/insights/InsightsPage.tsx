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

  const avgLatency =
    recent.length > 0
      ? recent.reduce((s, l) => s + l.latencyMinutes, 0) / recent.length
      : null

  const latencyGood = avgLatency != null && avgLatency < 20
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

            {/* Avg time to fall asleep */}
            <Card>
              <CardTitle>Avg to fall asleep</CardTitle>
              <p
                className={`text-2xl font-semibold mt-2 tabular-nums ${
                  avgLatency == null
                    ? ''
                    : latencyGood
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                }`}
              >
                {avgLatency != null ? `${Math.round(avgLatency)}m` : '—'}
              </p>
              <p className="text-[11px] text-lavender/40 mt-1">
                {latencyGood ? 'Under 20 min — healthy range' : avgLatency != null ? 'Over 20 min — room to improve' : ''}
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
