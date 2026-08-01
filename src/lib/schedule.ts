import type { Chronotype, WindDownStepId } from '@/data/types'
import { addMinutes, clampMinutes, minutesToHHMM } from './time'

export interface ScheduleInput {
  bedtimeMinutes: number
  wakeMinutes: number
  targetSleepMinutes: number
  expectedLatencyMinutes: number
  caffeineDoseMg: number
  chronotype: Chronotype
  /** Reference "now" for computing absolute times */
  now?: Date
}

export interface WindDownStep {
  id: WindDownStepId
  title: string
  detail: string
  /** Minutes before lights-out */
  leadMinutes: number
  /** Absolute clock time for this step */
  at: Date
  minutesFromMidnight: number
  label: string
}

export interface WakeSuggestion {
  /** Midpoint of the suggested wake window */
  mid: Date
  windowStart: Date
  windowEnd: Date
  note: string
}

export interface TonightSchedule {
  lightsOut: Date
  windDown: WindDownStep[]
  wake: WakeSuggestion
  bedtimeLabel: string
  wakeLabel: string
}

/** Caffeine cutoff hours before bed, scaled by dose (Gardiner et al. SMR 2023) */
export function caffeineLeadHours(doseMg: number): number {
  if (doseMg >= 180) return 13.2
  if (doseMg >= 80) return 8.8
  if (doseMg > 0) return 4
  return 0
}

function chronotypeShift(chronotype: Chronotype): number {
  if (chronotype === 'early') return -30
  if (chronotype === 'late') return 30
  return 0
}

interface StepDef {
  id: WindDownStepId
  title: string
  detail: string
  leadMinutes: number
}

export function buildWindDownDefs(caffeineDoseMg: number): StepDef[] {
  const caffeineHours = caffeineLeadHours(caffeineDoseMg)
  const steps: StepDef[] = []

  if (caffeineHours > 0) {
    steps.push({
      id: 'caffeine',
      title: 'Caffeine cutoff',
      detail:
        caffeineDoseMg >= 180
          ? 'Higher doses (pre-workout range) clear slowly — stop ~13 h before bed.'
          : 'Typical coffee (~100 mg) still affects sleep ~9 h later.',
      leadMinutes: Math.round(caffeineHours * 60),
    })
  }

  steps.push(
    {
      id: 'exercise',
      title: 'Finish intense exercise',
      detail: 'Hard workouts within 1 h of bed delay onset. Moderate movement is fine.',
      leadMinutes: 120,
    },
    {
      id: 'meal',
      title: 'Last large meal',
      detail: 'Leave ~3–4 h so digestion doesn’t fragment sleep.',
      leadMinutes: 180,
    },
    {
      id: 'alcohol',
      title: 'Alcohol cutoff',
      detail:
        'Harm-reduction guidance: stop 3–4 h before bed. Even small amounts reduce REM.',
      leadMinutes: 210,
    },
    {
      id: 'dim_lights',
      title: 'Dim ambient lights',
      detail:
        'Lower brightness for 2–3 h. Melatonin is suppressed by lux dose, not just “blue light.”',
      leadMinutes: 150,
    },
    {
      id: 'warm_content',
      title: 'Warm, calm screens',
      detail:
        'If you must use a screen: dim + warm + non-arousing content. Content often matters as much as spectrum.',
      leadMinutes: 120,
    },
    {
      id: 'hot_shower',
      title: 'Hot shower or bath',
      detail: '10+ min at ~40–42 °C, 1–2 h before bed, can shorten sleep onset.',
      leadMinutes: 90,
    },
    {
      id: 'screens_off',
      title: 'Screens off',
      detail: 'Park phones and laptops. Let your mind settle without new input.',
      leadMinutes: 60,
    },
    {
      id: 'noise_on',
      title: 'Start sleep sounds',
      detail: 'Soft brown or pink noise can mask abrupt sounds as you fall asleep.',
      leadMinutes: 15,
    },
    {
      id: 'lights_out',
      title: 'Lights out',
      detail: 'In bed, lights off. If awake ~20 min, get up briefly (stimulus control).',
      leadMinutes: 0,
    },
  )

  return steps.sort((a, b) => b.leadMinutes - a.leadMinutes)
}

export function buildTonightSchedule(input: ScheduleInput): TonightSchedule {
  const now = input.now ?? new Date()
  const shift = chronotypeShift(input.chronotype)
  const bedtime = clampMinutes(input.bedtimeMinutes + shift)

  const lightsOut = new Date(now)
  lightsOut.setSeconds(0, 0)
  lightsOut.setHours(Math.floor(bedtime / 60), bedtime % 60, 0, 0)
  // If bedtime already passed more than 12 hours ago, roll forward
  const hoursDiff = (lightsOut.getTime() - now.getTime()) / 3_600_000
  if (hoursDiff < -12) lightsOut.setDate(lightsOut.getDate() + 1)
  else if (hoursDiff > 18) lightsOut.setDate(lightsOut.getDate() - 1)

  const defs = buildWindDownDefs(input.caffeineDoseMg)
  const windDown: WindDownStep[] = defs.map((d) => {
    const at = addMinutes(lightsOut, -d.leadMinutes)
    const minutesFromMidnight = at.getHours() * 60 + at.getMinutes()
    return {
      ...d,
      at,
      minutesFromMidnight,
      label: minutesToHHMM(minutesFromMidnight),
    }
  })

  const sleepStart = addMinutes(lightsOut, input.expectedLatencyMinutes)
  const mid = addMinutes(sleepStart, input.targetSleepMinutes)
  const halfWindow = 25
  const wake: WakeSuggestion = {
    mid,
    windowStart: addMinutes(mid, -halfWindow),
    windowEnd: addMinutes(mid, halfWindow),
    note:
      'Suggested as a wake window (±25 min). Sleep cycles vary ~60–150 min night to night, so exact “90-minute” math is false precision.',
  }

  return {
    lightsOut,
    windDown,
    wake,
    bedtimeLabel: minutesToHHMM(bedtime),
    wakeLabel: minutesToHHMM(mid.getHours() * 60 + mid.getMinutes()),
  }
}

export function nextStep(
  schedule: TonightSchedule,
  now: Date = new Date(),
): WindDownStep | null {
  const upcoming = schedule.windDown.filter((s) => s.at.getTime() > now.getTime())
  return upcoming[0] ?? null
}

export function currentStep(
  schedule: TonightSchedule,
  now: Date = new Date(),
): WindDownStep | null {
  const passed = schedule.windDown.filter((s) => s.at.getTime() <= now.getTime())
  return passed[passed.length - 1] ?? null
}

export function suggestWakeFromBedtime(
  bedtimeMinutes: number,
  targetSleepMinutes: number,
  latencyMinutes: number,
): { midMinutes: number; startMinutes: number; endMinutes: number } {
  const mid = clampMinutes(bedtimeMinutes + latencyMinutes + targetSleepMinutes)
  return {
    midMinutes: mid,
    startMinutes: clampMinutes(mid - 25),
    endMinutes: clampMinutes(mid + 25),
  }
}

export function suggestBedtimeFromWake(
  wakeMinutes: number,
  targetSleepMinutes: number,
  latencyMinutes: number,
): number {
  return clampMinutes(wakeMinutes - targetSleepMinutes - latencyMinutes)
}
