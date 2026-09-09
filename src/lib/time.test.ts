import { describe, expect, it } from 'vitest'
import { suggestLightsOutDate } from './time'

describe('suggestLightsOutDate', () => {
  it('places a typical PM bedtime on the evening before the morning date', () => {
    // Morning of 2026-07-31, bedtime 23:00 → lights out on 2026-07-30 23:00
    const d = suggestLightsOutDate('2026-07-31', 23 * 60)
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(6) // July (0-indexed)
    expect(d.getDate()).toBe(30)
    expect(d.getHours()).toBe(23)
    expect(d.getMinutes()).toBe(0)
  })

  it('places an after-midnight bedtime on the morning date itself', () => {
    // Morning of 2026-07-31, bedtime 00:30 → lights out on 2026-07-31 00:30
    const d = suggestLightsOutDate('2026-07-31', 30)
    expect(d.getDate()).toBe(31)
    expect(d.getHours()).toBe(0)
    expect(d.getMinutes()).toBe(30)
  })

  it('treats exactly noon as belonging to the previous evening', () => {
    const d = suggestLightsOutDate('2026-07-31', 12 * 60)
    expect(d.getDate()).toBe(30)
    expect(d.getHours()).toBe(12)
  })
})
