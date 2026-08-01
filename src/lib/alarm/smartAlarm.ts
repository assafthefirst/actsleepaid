import { alarmAudio } from '@/lib/audio/alarm'
import type { AlarmConfig } from '@/data/types'
import { dateAtMinutes } from '@/lib/time'
import AlarmWorker from './worker?worker'

export type AlarmPhase = 'idle' | 'armed' | 'window' | 'ringing' | 'snoozed'

export type AlarmListener = (state: {
  phase: AlarmPhase
  fireAt: number | null
  windowStart: number | null
  sunriseProgress: number
}) => void

/**
 * Smart alarm controller.
 * Core: gentle ramp ending at target wake time inside a wake window.
 * Optional experimental: mic loudness / device motion to fire early in-window.
 */
export class SmartAlarm {
  private worker: Worker | null = null
  private phase: AlarmPhase = 'idle'
  private fireAt: number | null = null
  private windowStart: number | null = null
  private config: AlarmConfig | null = null
  private listeners = new Set<AlarmListener>()
  private wakeLock: WakeLockSentinel | null = null
  private restlessnessArmed = false
  private audioLevel = 0
  private motionLevel = 0
  private micStream: MediaStream | null = null
  private micCtx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private motionHandler: ((e: DeviceMotionEvent) => void) | null = null
  private monitorId: ReturnType<typeof setInterval> | null = null
  private sunriseProgress = 0
  private sunriseId: ReturnType<typeof setInterval> | null = null

  subscribe(fn: AlarmListener) {
    this.listeners.add(fn)
    fn(this.snapshot())
    return () => {
      this.listeners.delete(fn)
    }
  }

  private emit() {
    const snap = this.snapshot()
    this.listeners.forEach((fn) => fn(snap))
  }

  snapshot() {
    return {
      phase: this.phase,
      fireAt: this.fireAt,
      windowStart: this.windowStart,
      sunriseProgress: this.sunriseProgress,
    }
  }

  async arm(config: AlarmConfig, from: Date = new Date()) {
    await this.disarm()
    this.config = config
    if (!config.enabled) return

    const wake = dateAtMinutes(config.wakeMinutes, from, true)
    this.fireAt = wake.getTime()
    this.windowStart = wake.getTime() - config.windowMinutes * 60_000
    this.phase = 'armed'
    this.restlessnessArmed = false
    this.sunriseProgress = 0

    this.worker = new AlarmWorker()
    this.worker.onmessage = (e: MessageEvent) => this.onWorkerMessage(e)
    this.worker.postMessage({
      type: 'arm',
      windowStart: this.windowStart,
      fireAt: this.fireAt,
    })

    await this.requestWakeLock()
    this.emit()
  }

  private async onWorkerMessage(e: MessageEvent) {
    const data = e.data as {
      type: string
      now?: number
      reason?: string
    }

    if (data.type === 'window' && this.phase === 'armed') {
      this.phase = 'window'
      if (this.config?.experimentalRestlessness) {
        await this.startRestlessnessMonitor()
      }
      this.emit()
    }

    if (data.type === 'fire') {
      this.beginRing()
    }
  }

  private beginRing() {
    if (this.phase === 'ringing') return
    this.phase = 'ringing'
    this.stopRestlessnessMonitor()
    const ramp = (this.config?.rampMinutes ?? 5) * 60
    alarmAudio.setVolume(this.config?.volume ?? 0.7)
    alarmAudio.start(ramp)
    this.startSunrise(ramp)
    this.emit()
  }

  private startSunrise(rampSeconds: number) {
    if (this.sunriseId) clearInterval(this.sunriseId)
    const start = Date.now()
    this.sunriseId = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000
      this.sunriseProgress = Math.min(1, elapsed / rampSeconds)
      this.emit()
      if (this.sunriseProgress >= 1 && this.sunriseId) {
        clearInterval(this.sunriseId)
        this.sunriseId = null
      }
    }, 200)
  }

  snooze() {
    if (!this.config || this.fireAt == null) return
    alarmAudio.stop()
    if (this.sunriseId) {
      clearInterval(this.sunriseId)
      this.sunriseId = null
    }
    this.sunriseProgress = 0
    this.phase = 'snoozed'
    const next = Date.now() + this.config.snoozeMinutes * 60_000
    this.fireAt = next
    this.windowStart = next
    this.worker?.postMessage({
      type: 'arm',
      windowStart: next,
      fireAt: next,
    })
    this.emit()
  }

  dismiss() {
    alarmAudio.stop()
    void this.disarm()
  }

  async disarm() {
    this.worker?.postMessage({ type: 'disarm' })
    this.worker?.terminate()
    this.worker = null
    this.stopRestlessnessMonitor()
    if (this.sunriseId) {
      clearInterval(this.sunriseId)
      this.sunriseId = null
    }
    this.releaseWakeLock()
    this.phase = 'idle'
    this.fireAt = null
    this.windowStart = null
    this.sunriseProgress = 0
    this.emit()
  }

  private async requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen')
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null
        })
      }
    } catch {
      /* unsupported or denied */
    }
  }

  private releaseWakeLock() {
    void this.wakeLock?.release()
    this.wakeLock = null
  }

  private async startRestlessnessMonitor() {
    if (this.restlessnessArmed) return
    this.restlessnessArmed = true

    // Microphone loudness
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      })
      this.micCtx = new AudioContext()
      const src = this.micCtx.createMediaStreamSource(this.micStream)
      this.analyser = this.micCtx.createAnalyser()
      this.analyser.fftSize = 256
      src.connect(this.analyser)
    } catch {
      /* permission denied — motion-only */
    }

    // Device motion
    this.motionHandler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (!a) return
      const mag = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2)
      this.motionLevel = 0.8 * this.motionLevel + 0.2 * Math.abs(mag - 9.8)
    }
    window.addEventListener('devicemotion', this.motionHandler)

    this.monitorId = setInterval(() => {
      if (this.phase !== 'window') return
      if (this.analyser) {
        const data = new Uint8Array(this.analyser.frequencyBinCount)
        this.analyser.getByteTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128
          sum += v * v
        }
        this.audioLevel = Math.sqrt(sum / data.length)
      }

      // Thresholds tuned loosely — experimental
      const restless = this.audioLevel > 0.08 || this.motionLevel > 0.6
      const now = Date.now()
      if (
        restless &&
        this.windowStart != null &&
        this.fireAt != null &&
        now >= this.windowStart &&
        now < this.fireAt
      ) {
        this.beginRing()
      }
    }, 1500)
  }

  private stopRestlessnessMonitor() {
    if (this.monitorId) {
      clearInterval(this.monitorId)
      this.monitorId = null
    }
    if (this.motionHandler) {
      window.removeEventListener('devicemotion', this.motionHandler)
      this.motionHandler = null
    }
    this.micStream?.getTracks().forEach((t) => t.stop())
    this.micStream = null
    void this.micCtx?.close()
    this.micCtx = null
    this.analyser = null
    this.restlessnessArmed = false
  }
}

export const smartAlarm = new SmartAlarm()
