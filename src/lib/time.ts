/** Time helpers — minutes from midnight and formatting */

/**
 * Derives the target wake time from a given bedtime and sleep window.
 * wake = (bedtime + window) mod 1440, e.g. 23:00 + 7h → 06:00.
 */
export function deriveWakeMinutes(bedtimeMinutes: number, sleepWindowMinutes: number): number {
  return clampMinutes(bedtimeMinutes + sleepWindowMinutes)
}

export function clampMinutes(m: number): number {
  const n = ((m % (24 * 60)) + 24 * 60) % (24 * 60)
  return n
}

export function minutesToHHMM(minutes: number): string {
  const m = clampMinutes(minutes)
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return clampMinutes((h || 0) * 60 + (m || 0))
}

export function formatDuration(minutes: number): string {
  const abs = Math.abs(Math.round(minutes))
  const h = Math.floor(abs / 60)
  const m = abs % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function formatClock(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/** Build a Date for today (or tomorrow if already past) at minutes-from-midnight */
export function dateAtMinutes(
  minutes: number,
  from: Date = new Date(),
  preferFuture = true,
): Date {
  const d = new Date(from)
  d.setSeconds(0, 0)
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
  if (preferFuture && d.getTime() <= from.getTime() - 60_000) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

export function diffMinutes(a: Date, b: Date): number {
  return (a.getTime() - b.getTime()) / 60_000
}

export function todayISODate(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isWeekend(d = new Date()): boolean {
  const day = d.getDay()
  return day === 0 || day === 6
}

/**
 * Suggests the lights-out Date for a diary entry covering the night before
 * `morningDateISO` (YYYY-MM-DD), given only a time-of-day (`minutesOfDay`).
 *
 * A bedtime time-of-day is ambiguous on its own: 23:00 belongs to the
 * evening *before* the morning being logged, but 00:30 (after-midnight
 * bedtime) belongs to the morning date itself. We use a noon cutoff to
 * decide which calendar day the time-of-day falls on.
 */
export function suggestLightsOutDate(morningDateISO: string, minutesOfDay: number): Date {
  const [y, m, d] = morningDateISO.split('-').map(Number)
  const date = new Date(y, (m || 1) - 1, d || 1)
  const NOON = 12 * 60
  const clamped = clampMinutes(minutesOfDay)
  if (clamped >= NOON) {
    // Typical PM bedtime — belongs to the evening before the morning date.
    date.setDate(date.getDate() - 1)
  }
  // Otherwise it's an after-midnight bedtime — same calendar date as the morning.
  date.setHours(Math.floor(clamped / 60), clamped % 60, 0, 0)
  return date
}
