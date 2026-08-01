/**
 * Gradual sunrise-style alarm using Web Audio oscillators + gain ramp.
 * Keeps a silent looping buffer to reduce mobile audio-context suspension.
 */

export class AlarmAudio {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private oscA: OscillatorNode | null = null
  private oscB: OscillatorNode | null = null
  private keepAlive: AudioBufferSourceNode | null = null
  private _volume = 0.7
  private _playing = false

  get playing() {
    return this._playing
  }

  private ensure() {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0
      this.master.connect(this.ctx.destination)

      // Silent keep-alive buffer
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate)
      const src = this.ctx.createBufferSource()
      src.buffer = buf
      src.loop = true
      const silent = this.ctx.createGain()
      silent.gain.value = 0.0001
      src.connect(silent)
      silent.connect(this.ctx.destination)
      src.start()
      this.keepAlive = src
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v))
  }

  /** Start gentle two-tone ramp over rampSeconds */
  start(rampSeconds: number) {
    const ctx = this.ensure()
    if (!this.master) return
    this.stopOsc()

    const oscA = ctx.createOscillator()
    const oscB = ctx.createOscillator()
    oscA.type = 'sine'
    oscB.type = 'sine'
    oscA.frequency.value = 220
    oscB.frequency.value = 277.18 // C# — soft minor feel

    const mix = ctx.createGain()
    mix.gain.value = 0.5
    oscA.connect(mix)
    oscB.connect(mix)
    mix.connect(this.master)

    const now = ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(0.001, now)
    this.master.gain.exponentialRampToValueAtTime(
      Math.max(0.01, this._volume),
      now + Math.max(1, rampSeconds),
    )

    // Slow vibrato-ish pitch drift
    oscA.frequency.linearRampToValueAtTime(246.94, now + rampSeconds)
    oscB.frequency.linearRampToValueAtTime(311.13, now + rampSeconds)

    oscA.start()
    oscB.start()
    this.oscA = oscA
    this.oscB = oscB
    this._playing = true

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  }

  private stopOsc() {
    try {
      this.oscA?.stop()
      this.oscB?.stop()
    } catch {
      /* noop */
    }
    this.oscA?.disconnect()
    this.oscB?.disconnect()
    this.oscA = null
    this.oscB = null
  }

  stop() {
    if (this.master && this.ctx) {
      const now = this.ctx.currentTime
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.linearRampToValueAtTime(0, now + 0.4)
    }
    setTimeout(() => this.stopOsc(), 450)
    this._playing = false
  }

  dispose() {
    this.stop()
    try {
      this.keepAlive?.stop()
    } catch {
      /* noop */
    }
    void this.ctx?.close()
    this.ctx = null
    this.master = null
  }
}

export const alarmAudio = new AlarmAudio()
