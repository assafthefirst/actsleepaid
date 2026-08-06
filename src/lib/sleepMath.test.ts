import { describe, expect, it } from 'vitest'
import {
  computeMetrics,
  rollingSleepDebt,
  suggestTitration,
} from './sleepMath'
import type { SleepLog } from '@/data/types'

function makeLog(
  overrides: Partial<SleepLog> & {
    lightsOutISO: string
    finalWakeISO: string
    outOfBedISO: string
  },
): SleepLog {
  return {
    date: '2026-07-31',
    latencyMinutes: 15,
    awakenings: 1,
    awakeningMinutes: 10,
    quality: 3,
    mood: 3,
    tags: [],
    createdAt: '2026-07-31T08:00:00Z',
    ...overrides,
  }
}

describe('computeMetrics', () => {
  it('computes efficiency from time asleep / intended sleep period', () => {
    // Lights out 23:00, final wake 07:00, out of bed 07:15
    // TIB = lights-out to final wake = 8h = 480 min (SE uses final wake, not out-of-bed)
    // TST = TIB - latency - awakeningMinutes = 480 - 15 - 10 = 455 min
    // SE = 455 / 480 ≈ 94.8%
    const metrics = computeMetrics(
      makeLog({
        lightsOutISO: '2026-07-30T23:00:00',
        finalWakeISO: '2026-07-31T07:00:00',
        outOfBedISO: '2026-07-31T07:15:00',
        latencyMinutes: 15,
        awakeningMinutes: 10,
      }),
    )
    expect(metrics.timeInBedMinutes).toBe(480)
    expect(metrics.totalSleepMinutes).toBe(455)
    expect(metrics.sleepEfficiency).toBeCloseTo(94.8, 0)
  })
})

describe('suggestTitration', () => {
  function week(efficiencyTarget: 'low' | 'mid' | 'high'): SleepLog[] {
    // Craft logs to hit SE bands via TIB vs sleep
    return Array.from({ length: 7 }, (_, i) => {
      // low: lots of TIB, little sleep → SE ~70%
      // mid: SE ~87%
      // high: SE ~93%
      if (efficiencyTarget === 'low') {
        return makeLog({
          date: `2026-07-${String(24 + i).padStart(2, '0')}`,
          lightsOutISO: `2026-07-${String(23 + i).padStart(2, '0')}T22:00:00`,
          finalWakeISO: `2026-07-${String(24 + i).padStart(2, '0')}T07:00:00`,
          outOfBedISO: `2026-07-${String(24 + i).padStart(2, '0')}T07:30:00`,
          latencyMinutes: 60,
          awakeningMinutes: 90,
        })
      }
      if (efficiencyTarget === 'mid') {
        return makeLog({
          date: `2026-07-${String(24 + i).padStart(2, '0')}`,
          lightsOutISO: `2026-07-${String(23 + i).padStart(2, '0')}T23:00:00`,
          finalWakeISO: `2026-07-${String(24 + i).padStart(2, '0')}T07:00:00`,
          outOfBedISO: `2026-07-${String(24 + i).padStart(2, '0')}T07:10:00`,
          latencyMinutes: 20,
          awakeningMinutes: 30,
        })
      }
      return makeLog({
        date: `2026-07-${String(24 + i).padStart(2, '0')}`,
        lightsOutISO: `2026-07-${String(23 + i).padStart(2, '0')}T23:00:00`,
        finalWakeISO: `2026-07-${String(24 + i).padStart(2, '0')}T07:00:00`,
        outOfBedISO: `2026-07-${String(24 + i).padStart(2, '0')}T07:05:00`,
        latencyMinutes: 10,
        awakeningMinutes: 5,
      })
    })
  }

  it('suggests shrink when efficiency is low', () => {
    const s = suggestTitration(week('low'), 8 * 60)
    expect(s?.action).toBe('shrink')
    expect(s!.deltaMinutes).toBeGreaterThan(0)
  })

  it('suggests hold in the sweet spot', () => {
    const s = suggestTitration(week('mid'), 8 * 60)
    expect(s?.action).toBe('hold')
  })

  it('suggests expand when efficiency is high', () => {
    const s = suggestTitration(week('high'), 8 * 60)
    expect(s?.action).toBe('expand')
  })

  it('returns null with too few nights', () => {
    expect(suggestTitration(week('high').slice(0, 3), 480)).toBeNull()
  })
})

describe('rollingSleepDebt', () => {
  it('sums shortfall vs target', () => {
    const logs = [
      makeLog({
        date: '2026-07-31',
        lightsOutISO: '2026-07-30T23:00:00',
        finalWakeISO: '2026-07-31T06:00:00',
        outOfBedISO: '2026-07-31T06:00:00',
        latencyMinutes: 0,
        awakeningMinutes: 0,
      }),
    ]
    // 7h sleep vs 8h target → 60 min debt
    expect(rollingSleepDebt(logs, 8 * 60, 14)).toBe(60)
  })
})
