import { describe, expect, it } from 'vitest'
import {
  buildTonightSchedule,
  caffeineLeadHours,
  suggestBedtimeFromWake,
  suggestWakeFromBedtime,
} from './schedule'

describe('caffeineLeadHours', () => {
  it('scales by dose', () => {
    expect(caffeineLeadHours(0)).toBe(0)
    expect(caffeineLeadHours(50)).toBe(4)
    expect(caffeineLeadHours(107)).toBe(8.8)
    expect(caffeineLeadHours(218)).toBe(13.2)
  })
})

describe('buildTonightSchedule', () => {
  it('places lights-out and wind-down steps before it', () => {
    const now = new Date('2026-07-31T12:00:00')
    const schedule = buildTonightSchedule({
      bedtimeMinutes: 23 * 60,
      wakeMinutes: 7 * 60,
      targetSleepMinutes: 8 * 60,
      expectedLatencyMinutes: 15,
      caffeineDoseMg: 107,
      chronotype: 'intermediate',
      now,
    })

    expect(schedule.bedtimeLabel).toBe('23:00')
    expect(schedule.lightsOut.getHours()).toBe(23)
    expect(schedule.lightsOut.getMinutes()).toBe(0)

    const caffeine = schedule.windDown.find((s) => s.id === 'caffeine')
    expect(caffeine).toBeTruthy()
    // 8.8h before 23:00 ≈ 14:12
    expect(caffeine!.leadMinutes).toBe(Math.round(8.8 * 60))

    const screens = schedule.windDown.find((s) => s.id === 'screens_off')
    expect(screens!.label).toBe('22:00')

    const dim = schedule.windDown.find((s) => s.id === 'dim_lights')
    expect(dim!.leadMinutes).toBe(150)

    // Wake window is ±25 around mid
    const span =
      (schedule.wake.windowEnd.getTime() - schedule.wake.windowStart.getTime()) /
      60_000
    expect(span).toBe(50)

    // mid = 23:00 + 15 + 480 = 07:15 next day
    expect(schedule.wake.mid.getHours()).toBe(7)
    expect(schedule.wake.mid.getMinutes()).toBe(15)
  })

  it('orders steps by lead time descending', () => {
    const schedule = buildTonightSchedule({
      bedtimeMinutes: 22 * 60,
      wakeMinutes: 6 * 60,
      targetSleepMinutes: 7.5 * 60,
      expectedLatencyMinutes: 15,
      caffeineDoseMg: 100,
      chronotype: 'intermediate',
      now: new Date('2026-07-31T10:00:00'),
    })
    for (let i = 1; i < schedule.windDown.length; i++) {
      expect(schedule.windDown[i - 1].leadMinutes).toBeGreaterThanOrEqual(
        schedule.windDown[i].leadMinutes,
      )
    }
  })
})

describe('wake/bedtime suggestions', () => {
  it('suggests a wake window from bedtime', () => {
    const w = suggestWakeFromBedtime(23 * 60, 8 * 60, 15)
    expect(w.midMinutes).toBe(7 * 60 + 15)
    expect(w.startMinutes).toBe(6 * 60 + 50)
    expect(w.endMinutes).toBe(7 * 60 + 40)
  })

  it('suggests bedtime from wake', () => {
    expect(suggestBedtimeFromWake(7 * 60, 8 * 60, 15)).toBe(22 * 60 + 45)
  })
})
