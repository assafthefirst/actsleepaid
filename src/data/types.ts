/** Shared domain types for the ACT Sleep Companion */

export type Chronotype = 'early' | 'intermediate' | 'late'

export type ThoughtPattern =
  | 'catastrophizing'
  | 'sleep_effort'
  | 'clock_watching'
  | 'self_judgment'
  | 'reason_giving'
  | 'other'

export type DiaryTag =
  | 'caffeine'
  | 'alcohol'
  | 'exercise'
  | 'screens'
  | 'stress'
  | 'nap'
  | 'travel'

export type NoisePreset = 'white' | 'pink' | 'brown' | 'rain' | 'ocean' | 'fan'

export type WindDownStepId =
  | 'caffeine'
  | 'exercise'
  | 'meal'
  | 'alcohol'
  | 'dim_lights'
  | 'warm_content'
  | 'hot_shower'
  | 'screens_off'
  | 'noise_on'
  | 'lights_out'

export interface AlarmConfig {
  enabled: boolean
  /** Target wake time as minutes from midnight (0–1439) */
  wakeMinutes: number
  /** Minutes before wake time to begin the smart window */
  windowMinutes: number
  /** Minutes for audio/screen ramp */
  rampMinutes: number
  snoozeMinutes: number
  /** Experimental mic/motion restlessness detection */
  experimentalRestlessness: boolean
  volume: number
}

export interface AppSettings {
  id: 'settings'
  onboardingComplete: boolean
  targetSleepMinutes: number
  /** Desired bedtime as minutes from midnight */
  bedtimeMinutes: number
  /** Desired wake as minutes from midnight */
  wakeMinutes: number
  expectedLatencyMinutes: number
  chronotype: Chronotype
  weekendBedtimeMinutes: number
  weekendWakeMinutes: number
  useWeekendSchedule: boolean
  caffeineDoseMg: number
  nightWarmOverlay: boolean
  noisePreset: NoisePreset
  noiseVolume: number
  noiseFadeOutMinutes: number
  /** Auto-play sleep sounds when Sleep Mode opens */
  autoStartSound: boolean
  /** Speak ACT exercise / path steps aloud */
  voiceOverEnabled: boolean
  /** Speech rate multiplier for voice-over */
  voiceRate: number
  alarm: AlarmConfig
  /** Current suggested sleep window length (Spielman titration) */
  sleepWindowMinutes: number
  values: string[]
}

export interface SleepLog {
  id?: number
  /** Calendar date of the morning (YYYY-MM-DD) — the night that just ended */
  date: string
  lightsOutISO: string
  latencyMinutes: number
  awakenings: number
  awakeningMinutes: number
  finalWakeISO: string
  outOfBedISO: string
  quality: number
  mood: number
  tags: DiaryTag[]
  notes?: string
  createdAt: string
}

export interface ThoughtLog {
  id?: number
  createdAt: string
  /** Raw thought as noticed */
  thought: string
  /** Defused framing: "I'm having the thought that…" */
  defused: string
  pattern: ThoughtPattern
  /** Willingness to have the thought without struggling (0–10) */
  willingness: number
  /** Value this relates to */
  value?: string
  /** Committed action chosen */
  committedAction?: string
  /** Optional workable response — framed as response, not replacement */
  workableResponse?: string
}

export interface ExerciseSession {
  id?: number
  exerciseId: string
  startedAt: string
  completedAt?: string
  durationSeconds: number
}

export interface ExportPayload {
  version: 1
  exportedAt: string
  settings: AppSettings
  sleepLogs: SleepLog[]
  thoughtLogs: ThoughtLog[]
  sessions: ExerciseSession[]
}

export const DEFAULT_ALARM: AlarmConfig = {
  enabled: true,
  wakeMinutes: 7 * 60,
  windowMinutes: 25,
  rampMinutes: 5,
  snoozeMinutes: 8,
  experimentalRestlessness: false,
  volume: 0.7,
}

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'settings',
  onboardingComplete: false,
  targetSleepMinutes: 8 * 60,
  bedtimeMinutes: 23 * 60,
  wakeMinutes: 7 * 60,
  expectedLatencyMinutes: 15,
  chronotype: 'intermediate',
  weekendBedtimeMinutes: 23 * 60 + 30,
  weekendWakeMinutes: 8 * 60,
  useWeekendSchedule: true,
  caffeineDoseMg: 107,
  nightWarmOverlay: true,
  noisePreset: 'brown',
  noiseVolume: 0.55,
  noiseFadeOutMinutes: 45,
  autoStartSound: true,
  voiceOverEnabled: true,
  voiceRate: 0.95,
  alarm: { ...DEFAULT_ALARM },
  sleepWindowMinutes: 8 * 60,
  values: ['Rest', 'Presence', 'Kindness', 'Energy for what matters'],
}
