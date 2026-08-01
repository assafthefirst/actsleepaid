import type { NoisePreset } from '@/data/types'

export type NoiseEngineState = {
  playing: boolean
  preset: NoisePreset
  volume: number
}

type FadeHandle = { cancelled: boolean }

/**
 * Procedural noise via Web Audio — no asset files.
 * White / pink / brown from filtered noise buffers;
 * rain / ocean / fan are modulated variants of the same source.
 */
export class NoiseEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private source: AudioBufferSourceNode | null = null
  private filter: BiquadFilterNode | null = null
  private lfo: OscillatorNode | null = null
  private lfoGain: GainNode | null = null
  private fade: FadeHandle | null = null
  private sleepTimer: ReturnType<typeof setTimeout> | null = null
  private _playing = false
  private _preset: NoisePreset = 'brown'
  private _volume = 0.4

  get playing() {
    return this._playing
  }

  get preset() {
    return this._preset
  }

  get volume() {
    return this._volume
  }

  private ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.master = this.ctx.createGain()
      this.master.gain.value = this._volume
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  private makeNoiseBuffer(seconds = 2): AudioBuffer {
    const ctx = this.ensureContext()
    const sampleRate = ctx.sampleRate
    const length = sampleRate * seconds
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
    return buffer
  }

  private stopNodes() {
    try {
      this.source?.stop()
    } catch {
      /* already stopped */
    }
    try {
      this.lfo?.stop()
    } catch {
      /* already stopped */
    }
    this.source?.disconnect()
    this.filter?.disconnect()
    this.lfo?.disconnect()
    this.lfoGain?.disconnect()
    this.source = null
    this.filter = null
    this.lfo = null
    this.lfoGain = null
  }

  private connectPreset(preset: NoisePreset) {
    const ctx = this.ensureContext()
    if (!this.master) return

    this.stopNodes()

    const buffer = this.makeNoiseBuffer(2)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const filter = ctx.createBiquadFilter()
    let lastNode: AudioNode = source

    switch (preset) {
      case 'white':
        filter.type = 'allpass'
        filter.frequency.value = 1000
        source.connect(filter)
        lastNode = filter
        break
      case 'pink':
        // Approximate pink via lowpass on white
        filter.type = 'lowpass'
        filter.frequency.value = 900
        filter.Q.value = 0.5
        source.connect(filter)
        lastNode = filter
        break
      case 'brown':
        filter.type = 'lowpass'
        filter.frequency.value = 280
        filter.Q.value = 0.7
        source.connect(filter)
        lastNode = filter
        break
      case 'rain': {
        filter.type = 'bandpass'
        filter.frequency.value = 1200
        filter.Q.value = 0.6
        source.connect(filter)
        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.frequency.value = 0.25
        lfoGain.gain.value = 0.15
        lfo.connect(lfoGain)
        lfoGain.connect(this.master.gain)
        lfo.start()
        this.lfo = lfo
        this.lfoGain = lfoGain
        lastNode = filter
        break
      }
      case 'ocean': {
        filter.type = 'lowpass'
        filter.frequency.value = 400
        filter.Q.value = 0.8
        source.connect(filter)
        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.type = 'sine'
        lfo.frequency.value = 0.08
        lfoGain.gain.value = 0.25
        lfo.connect(lfoGain)
        // Modulate filter frequency for wave wash
        const freqGain = ctx.createGain()
        freqGain.gain.value = 180
        lfo.connect(freqGain)
        freqGain.connect(filter.frequency)
        lfo.start()
        this.lfo = lfo
        this.lfoGain = lfoGain
        lastNode = filter
        break
      }
      case 'fan': {
        filter.type = 'lowpass'
        filter.frequency.value = 500
        filter.Q.value = 1.2
        source.connect(filter)
        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.frequency.value = 12
        lfoGain.gain.value = 0.04
        lfo.connect(lfoGain)
        lfoGain.connect(this.master.gain)
        lfo.start()
        this.lfo = lfo
        this.lfoGain = lfoGain
        lastNode = filter
        break
      }
    }

    this.filter = filter
    this.source = source
    lastNode.connect(this.master)
    source.start()
  }

  async play(preset?: NoisePreset, fadeInMs = 1200) {
    if (preset) this._preset = preset
    this.clearSleepTimer()
    if (this.fade) this.fade.cancelled = true

    this.ensureContext()
    this.connectPreset(this._preset)
    this._playing = true

    if (this.master && fadeInMs > 0) {
      const g = this.master.gain
      const now = this.ctx!.currentTime
      g.cancelScheduledValues(now)
      g.setValueAtTime(0, now)
      g.linearRampToValueAtTime(this._volume, now + fadeInMs / 1000)
    } else if (this.master) {
      this.master.gain.value = this._volume
    }
  }

  async stop(fadeOutMs = 800) {
    this.clearSleepTimer()
    if (!this._playing || !this.master || !this.ctx) {
      this._playing = false
      this.stopNodes()
      return
    }

    if (this.fade) this.fade.cancelled = true
    const handle: FadeHandle = { cancelled: false }
    this.fade = handle

    const g = this.master.gain
    const now = this.ctx.currentTime
    g.cancelScheduledValues(now)
    g.setValueAtTime(g.value, now)
    g.linearRampToValueAtTime(0, now + fadeOutMs / 1000)

    await new Promise((r) => setTimeout(r, fadeOutMs + 50))
    if (handle.cancelled) return

    this.stopNodes()
    this._playing = false
  }

  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v))
    if (this.master && this._playing) {
      const now = this.ctx!.currentTime
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.linearRampToValueAtTime(this._volume, now + 0.05)
    }
  }

  async setPreset(preset: NoisePreset) {
    this._preset = preset
    if (this._playing) {
      await this.play(preset, 400)
    }
  }

  /** Fade out after `minutes`, optionally starting from lights-out */
  scheduleFadeOut(minutes: number) {
    this.clearSleepTimer()
    if (minutes <= 0) return
    this.sleepTimer = setTimeout(
      () => {
        void this.stop(8000)
      },
      minutes * 60_000,
    )
  }

  clearSleepTimer() {
    if (this.sleepTimer) {
      clearTimeout(this.sleepTimer)
      this.sleepTimer = null
    }
  }

  dispose() {
    void this.stop(0)
    this.clearSleepTimer()
    void this.ctx?.close()
    this.ctx = null
    this.master = null
  }
}

export const noiseEngine = new NoiseEngine()
