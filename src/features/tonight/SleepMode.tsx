import { useEffect, useRef, useState } from 'react'
import type { TonightSchedule } from '@/lib/schedule'
import { currentStep, nextStep } from '@/lib/schedule'
import { useSettings, useSettingsStore } from '@/app/settingsStore'
import { noiseEngine } from '@/lib/audio/noise'
import { alarmAudio } from '@/lib/audio/alarm'
import { smartAlarm, type AlarmPhase } from '@/lib/alarm/smartAlarm'
import { wakeLockController } from '@/lib/wakeLock'
import type { NoisePreset } from '@/data/types'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { Link } from 'react-router-dom'

/**
 * ACT-friendly copy: we deliberately never show the literal clock while
 * trying to sleep. Watching the time invites the mind to start calculating
 * ("it's 2:47, I only have 4h left...") which fuels sleep-related anxiety.
 */
function sleepModeCopy(phase: AlarmPhase): { title: string; subtitle: string } {
  switch (phase) {
    case 'ringing':
      return {
        title: 'Time to get up',
        subtitle: 'Gently waking you now — take your time.',
      }
    case 'window':
      return {
        title: 'Time to get up soon',
        subtitle: "Your wake window is open. It's fine to get up now if you're ready.",
      }
    case 'snoozed':
      return {
        title: 'A few more minutes',
        subtitle: "We'll check back gently soon.",
      }
    default:
      return {
        title: 'Sleep time',
        subtitle: "No need to watch the clock — we'll wake you gently within your window.",
      }
  }
}

type Props = {
  schedule: TonightSchedule
  onExit: () => void
}

const PRESETS: { value: NoisePreset; label: string }[] = [
  { value: 'white', label: 'White' },
  { value: 'pink', label: 'Pink' },
  { value: 'brown', label: 'Brown' },
  { value: 'rain', label: 'Rain' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'fan', label: 'Fan' },
]

export function SleepMode({ schedule, onExit }: Props) {
  const settings = useSettings()
  const patch = useSettingsStore((s) => s.patch)
  const [now, setNow] = useState(() => new Date())
  const [noiseOn, setNoiseOn] = useState(noiseEngine.playing)
  const [soundPanelOpen, setSoundPanelOpen] = useState(false)
  const [alarmPhase, setAlarmPhase] = useState(smartAlarm.snapshot().phase)
  const [sunrise, setSunrise] = useState(0)
  const autoStarted = useRef(false)

  useEffect(() => {
    // Only needed to advance the wind-down step list — no literal clock is shown,
    // so a coarse interval is enough and easier on battery.
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    return smartAlarm.subscribe((s) => {
      setAlarmPhase(s.phase)
      setSunrise(s.sunriseProgress)
    })
  }, [])

  // Keep the screen awake for as long as Sleep Mode is open, and nudge the
  // audio contexts back awake if the OS suspended them while backgrounded.
  useEffect(() => {
    void wakeLockController.acquire()
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      noiseEngine.resume()
      alarmAudio.resume()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      void wakeLockController.release()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  useEffect(() => {
    // Arm alarm for tonight's wake target
    const cfg = {
      ...settings.alarm,
      wakeMinutes:
        schedule.wake.mid.getHours() * 60 + schedule.wake.mid.getMinutes(),
    }
    void smartAlarm.arm(cfg)
    return () => {
      void smartAlarm.disarm()
    }
  }, [settings.alarm, schedule.wake.mid])

  // Sleep sounds default to on (brown noise, audible) as soon as Sleep Mode opens.
  useEffect(() => {
    if (autoStarted.current) return
    autoStarted.current = true
    if (settings.autoStartSound && !noiseEngine.playing) {
      void noiseEngine.play(settings.noisePreset).then(() => {
        noiseEngine.setVolume(settings.noiseVolume)
        noiseEngine.scheduleFadeOut(settings.noiseFadeOutMinutes)
        setNoiseOn(true)
      })
    } else {
      setNoiseOn(noiseEngine.playing)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const step = currentStep(schedule, now) ?? nextStep(schedule, now)

  const toggleNoise = async () => {
    if (noiseEngine.playing) {
      await noiseEngine.stop()
      setNoiseOn(false)
    } else {
      await noiseEngine.play(settings.noisePreset)
      noiseEngine.setVolume(settings.noiseVolume)
      noiseEngine.scheduleFadeOut(settings.noiseFadeOutMinutes)
      setNoiseOn(true)
    }
  }

  const switchPreset = async (preset: NoisePreset) => {
    await patch({ noisePreset: preset })
    if (noiseEngine.playing) {
      await noiseEngine.setPreset(preset)
    }
  }

  const sunriseStyle =
    alarmPhase === 'ringing'
      ? {
          background: `radial-gradient(ellipse at bottom, rgba(251,146,60,${0.15 + sunrise * 0.55}) 0%, rgba(10,10,18,${1 - sunrise * 0.4}) 70%)`,
        }
      : undefined

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col bg-night-950 text-mist"
      style={sunriseStyle}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <Button variant="ghost" size="sm" onClick={onExit}>
          Exit
        </Button>
        <p className="text-xs text-lavender/50 uppercase tracking-widest">
          Sleep Mode
        </p>
        <span className="w-12" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="max-w-xs">
          <p className="text-4xl sm:text-5xl font-light tracking-tight">
            {sleepModeCopy(alarmPhase).title}
          </p>
          <p className="text-sm text-lavender/50 mt-2">
            {sleepModeCopy(alarmPhase).subtitle}
          </p>
        </div>

        {step && alarmPhase !== 'ringing' && (
          <div>
            <p className="text-xs uppercase tracking-widest text-violet-soft/70">
              {step.at.getTime() <= now.getTime() ? 'Now' : 'Next'}
            </p>
            <p className="text-xl mt-1 font-medium">{step.title}</p>
            <p className="text-sm text-lavender/50 mt-1 max-w-sm mx-auto">
              {step.detail}
            </p>
          </div>
        )}

        {alarmPhase === 'ringing' && (
          <div className="flex gap-3">
            <Button onClick={() => smartAlarm.snooze()}>Snooze</Button>
            <Button variant="secondary" onClick={() => smartAlarm.dismiss()}>
              I&apos;m up
            </Button>
          </div>
        )}

        {(alarmPhase === 'armed' || alarmPhase === 'window' || alarmPhase === 'snoozed') && (
          <p className="text-xs text-lavender/40">
            Alarm {alarmPhase}
            {settings.alarm.experimentalRestlessness
              ? ' · experimental restlessness on'
              : ''}
          </p>
        )}
      </div>

      <div className="px-4 pb-6 space-y-3">
        <div className="rounded-2xl bg-night-800/70 border border-night-600/50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-violet-soft/70">
                Sound
              </p>
              <p className="text-sm font-medium capitalize mt-0.5">
                {settings.noisePreset} noise · {noiseOn ? 'playing' : 'stopped'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={noiseOn ? 'primary' : 'secondary'}
                onClick={() => void toggleNoise()}
              >
                {noiseOn ? 'Stop' : 'Play'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSoundPanelOpen((o) => !o)}
              >
                {soundPanelOpen ? 'Hide' : 'Adjust'}
              </Button>
            </div>
          </div>

          {soundPanelOpen && (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => void switchPreset(p.value)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      settings.noisePreset === p.value
                        ? 'bg-indigo-glow/30 border-indigo-glow text-mist'
                        : 'border-night-500 text-lavender/70'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <Slider
                label="Volume"
                value={Math.round(settings.noiseVolume * 100)}
                min={0}
                max={100}
                onChange={(v) => {
                  const vol = v / 100
                  noiseEngine.setVolume(vol)
                  void patch({ noiseVolume: vol })
                }}
                display={`${Math.round(settings.noiseVolume * 100)}%`}
              />
              <p className="text-[11px] text-lavender/40">
                More sound options — fade timer, autoplay — live in Settings.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Link to="/thoughts">
            <Button variant="ghost">Thought log</Button>
          </Link>
          <Link to="/exercises?exercise=dropping-anchor-2m">
            <Button variant="ghost">Drop anchor</Button>
          </Link>
        </div>
      </div>

      <p className="text-center text-[11px] text-lavender/35 px-6 pb-6 leading-relaxed">
        This screen keeps your device awake while open. Keep the tab open for the
        alarm to ring, and set a backup phone alarm until a native build exists.
        This is a self-help tool, not medical advice.
      </p>
    </div>
  )
}
