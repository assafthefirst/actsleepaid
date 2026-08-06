import type { SleepLog } from '@/data/types'
import { diffMinutes } from './time'

export interface SleepMetrics {
  timeInBedMinutes: number
  totalSleepMinutes: number
  sleepEfficiency: number
  midSleepMinutes: number
}

export function computeMetrics(log: SleepLog): SleepMetrics {
  const lightsOut = new Date(log.lightsOutISO)
  const finalWake = new Date(log.finalWakeISO)

  // SE denominator = lights-out to final wake (intended sleep period, not time to get up)
  const timeInBedMinutes = Math.max(0, diffMinutes(finalWake, lightsOut))
  const totalSleepMinutes = Math.max(
    0,
    timeInBedMinutes - log.latencyMinutes - (log.awakeningMinutes || 0),
  )
  const sleepEfficiency =
    timeInBedMinutes > 0
      ? Math.min(100, (totalSleepMinutes / timeInBedMinutes) * 100)
      : 0

  const mid = new Date(
    lightsOut.getTime() + (finalWake.getTime() - lightsOut.getTime()) / 2,
  )
  const midSleepMinutes = mid.getHours() * 60 + mid.getMinutes()

  return {
    timeInBedMinutes: Math.round(timeInBedMinutes),
    totalSleepMinutes: Math.round(totalSleepMinutes),
    sleepEfficiency: Math.round(sleepEfficiency * 10) / 10,
    midSleepMinutes,
  }
}

export type TitrationAction = 'shrink' | 'hold' | 'expand'

export interface TitrationSuggestion {
  action: TitrationAction
  /** Minutes to adjust the sleep window */
  deltaMinutes: number
  averageEfficiency: number
  nights: number
  message: string
}

/**
 * Spielman sleep-window titration.
 * Uses recent nights (default 7) of efficiency:
 * <85% shrink 15–30, 85–90% hold, ≥90% expand 15.
 */
export function suggestTitration(
  logs: SleepLog[],
  currentWindowMinutes: number,
  lookback = 7,
): TitrationSuggestion | null {
  const recent = logs.slice(0, lookback)
  if (recent.length < 5) return null

  const efficiencies = recent.map((l) => computeMetrics(l).sleepEfficiency)
  const averageEfficiency =
    efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length

  if (averageEfficiency < 85) {
    const delta = averageEfficiency < 80 ? 30 : 15
    const next = Math.max(5 * 60, currentWindowMinutes - delta)
    return {
      action: 'shrink',
      deltaMinutes: currentWindowMinutes - next,
      averageEfficiency: Math.round(averageEfficiency * 10) / 10,
      nights: recent.length,
      message: `Your sleep efficiency averaged ${averageEfficiency.toFixed(0)}% over ${recent.length} nights. Shrinking time in bed by ${currentWindowMinutes - next} min can consolidate sleep. This is an invitation — only accept if it feels workable.`,
    }
  }

  if (averageEfficiency >= 90) {
    const delta = 15
    const next = Math.min(10 * 60, currentWindowMinutes + delta)
    if (next === currentWindowMinutes) {
      return {
        action: 'hold',
        deltaMinutes: 0,
        averageEfficiency: Math.round(averageEfficiency * 10) / 10,
        nights: recent.length,
        message: `Efficiency is strong (${averageEfficiency.toFixed(0)}%). Window is already at a comfortable max.`,
      }
    }
    return {
      action: 'expand',
      deltaMinutes: delta,
      averageEfficiency: Math.round(averageEfficiency * 10) / 10,
      nights: recent.length,
      message: `Efficiency averaged ${averageEfficiency.toFixed(0)}%. You could gently expand time in bed by ${delta} min if you want more opportunity to sleep.`,
    }
  }

  return {
    action: 'hold',
    deltaMinutes: 0,
    averageEfficiency: Math.round(averageEfficiency * 10) / 10,
    nights: recent.length,
    message: `Efficiency is in the sweet spot (${averageEfficiency.toFixed(0)}%). Hold your current window.`,
  }
}

export function bedtimeConsistencyStdDev(logs: SleepLog[]): number | null {
  if (logs.length < 3) return null
  const minutes = logs.map((l) => {
    const d = new Date(l.lightsOutISO)
    return d.getHours() * 60 + d.getMinutes()
  })
  // Unwrap around midnight: treat times near 0 as after 24h when mean is late
  const mean = minutes.reduce((a, b) => a + b, 0) / minutes.length
  const unwrapped = minutes.map((m) => {
    if (mean > 18 * 60 && m < 6 * 60) return m + 24 * 60
    if (mean < 6 * 60 && m > 18 * 60) return m - 24 * 60
    return m
  })
  const m2 = unwrapped.reduce((a, b) => a + b, 0) / unwrapped.length
  const variance =
    unwrapped.reduce((a, b) => a + (b - m2) ** 2, 0) / unwrapped.length
  return Math.round(Math.sqrt(variance))
}

export function rollingSleepDebt(
  logs: SleepLog[],
  targetMinutes: number,
  days = 14,
): number {
  const recent = logs.slice(0, days)
  if (!recent.length) return 0
  const total = recent.reduce(
    (sum, l) => sum + computeMetrics(l).totalSleepMinutes,
    0,
  )
  const expected = targetMinutes * recent.length
  return Math.round(expected - total)
}
