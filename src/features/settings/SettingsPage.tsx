import { useRef, useState } from 'react'
import { useSettings, useSettingsStore } from '@/app/settingsStore'
import { downloadExport, importFromFile } from '@/data/export'
import { clearAllData } from '@/data/repo'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TimePicker } from '@/components/ui/TimePicker'
import { Slider } from '@/components/ui/Slider'
import { Segmented } from '@/components/ui/Segmented'
import type { Chronotype, NoisePreset } from '@/data/types'
import { formatDuration, deriveWakeMinutes } from '@/lib/time'
import { Link } from 'react-router-dom'
import { noiseEngine } from '@/lib/audio/noise'
import { isVoiceSupported } from '@/lib/voice'

const NOISE_PRESETS: { value: NoisePreset; label: string; hint: string }[] = [
  { value: 'white', label: 'White', hint: 'Full-spectrum hiss' },
  { value: 'pink', label: 'Pink', hint: 'Softer, balanced' },
  { value: 'brown', label: 'Brown', hint: 'Deep rumble' },
  { value: 'rain', label: 'Rain', hint: 'Bandpass + flutter' },
  { value: 'ocean', label: 'Ocean', hint: 'Slow wave wash' },
  { value: 'fan', label: 'Fan', hint: 'Steady hum' },
]

export function SettingsPage() {
  const settings = useSettings()
  const patch = useSettingsStore((s) => s.patch)
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const voiceSupported = isVoiceSupported()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-lavender/60 mt-1">
          Local-only · nothing leaves this device.
        </p>
      </div>

      <Card>
        <CardTitle>Schedule defaults</CardTitle>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <TimePicker
            label="Weekday bedtime"
            valueMinutes={settings.bedtimeMinutes}
            onChange={(m) => {
              const wake = deriveWakeMinutes(m, settings.sleepWindowMinutes)
              void patch({ bedtimeMinutes: m, wakeMinutes: wake, alarm: { ...settings.alarm, wakeMinutes: wake } })
            }}
          />
          <TimePicker
            label="Weekday wake"
            valueMinutes={settings.wakeMinutes}
            onChange={(m) =>
              void patch({
                wakeMinutes: m,
                alarm: { ...settings.alarm, wakeMinutes: m },
              })
            }
          />
          <TimePicker
            label="Weekend bedtime"
            valueMinutes={settings.weekendBedtimeMinutes}
            onChange={(m) => {
              const wake = deriveWakeMinutes(m, settings.sleepWindowMinutes)
              void patch({ weekendBedtimeMinutes: m, weekendWakeMinutes: wake })
            }}
          />
          <TimePicker
            label="Weekend wake"
            valueMinutes={settings.weekendWakeMinutes}
            onChange={(m) => void patch({ weekendWakeMinutes: m })}
          />
        </div>
        <p className="text-[11px] text-lavender/40 mt-2">
          Wake times are auto-derived from bedtime + window — tap them to override.
        </p>
        <label className="flex items-center gap-2 mt-4 text-sm text-lavender/80">
          <input
            type="checkbox"
            checked={settings.useWeekendSchedule}
            onChange={(e) => void patch({ useWeekendSchedule: e.target.checked })}
            className="accent-indigo-glow"
          />
          Use weekend schedule Sat–Sun
        </label>
        <div className="mt-4">
          <Slider
            label="Target sleep / window"
            value={settings.sleepWindowMinutes}
            min={300}
            max={600}
            step={15}
            onChange={(v) => {
              const wake = deriveWakeMinutes(settings.bedtimeMinutes, v)
              const weekendWake = deriveWakeMinutes(settings.weekendBedtimeMinutes, v)
              void patch({
                sleepWindowMinutes: v,
                targetSleepMinutes: v,
                wakeMinutes: wake,
                weekendWakeMinutes: weekendWake,
                alarm: { ...settings.alarm, wakeMinutes: wake },
              })
            }}
            display={formatDuration(settings.sleepWindowMinutes)}
          />
        </div>
        <div className="mt-4">
          <Slider
            label="Expected sleep latency"
            value={settings.expectedLatencyMinutes}
            min={5}
            max={45}
            step={5}
            onChange={(v) => void patch({ expectedLatencyMinutes: v })}
            display={`${settings.expectedLatencyMinutes}m`}
          />
        </div>
        <div className="mt-4">
          <p className="text-sm text-lavender/70 mb-2">Chronotype nudge</p>
          <Segmented<Chronotype>
            value={settings.chronotype}
            onChange={(v) => void patch({ chronotype: v })}
            options={[
              { value: 'early', label: 'Early (−30m)' },
              { value: 'intermediate', label: 'Middle' },
              { value: 'late', label: 'Late (+30m)' },
            ]}
          />
        </div>
        <div className="mt-4">
          <Slider
            label="Typical caffeine dose (mg)"
            value={settings.caffeineDoseMg}
            min={0}
            max={250}
            step={10}
            onChange={(v) => void patch({ caffeineDoseMg: v })}
            display={`${settings.caffeineDoseMg} mg`}
          />
          <p className="text-xs text-lavender/40 mt-1">
            Coffee ~100 mg · pre-workout often 200+. Scales the caffeine cutoff.
          </p>
        </div>
      </Card>

      <Card>
        <CardTitle>Smart alarm</CardTitle>
        <label className="flex items-center gap-2 mt-4 text-sm">
          <input
            type="checkbox"
            checked={settings.alarm.enabled}
            onChange={(e) =>
              void patch({ alarm: { ...settings.alarm, enabled: e.target.checked } })
            }
            className="accent-indigo-glow"
          />
          Enabled in Sleep Mode
        </label>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <Slider
            label="Wake window"
            value={settings.alarm.windowMinutes}
            min={10}
            max={45}
            step={5}
            onChange={(v) =>
              void patch({ alarm: { ...settings.alarm, windowMinutes: v } })
            }
            display={`${settings.alarm.windowMinutes}m`}
          />
          <Slider
            label="Ramp duration"
            value={settings.alarm.rampMinutes}
            min={3}
            max={10}
            onChange={(v) =>
              void patch({ alarm: { ...settings.alarm, rampMinutes: v } })
            }
            display={`${settings.alarm.rampMinutes}m`}
          />
          <Slider
            label="Snooze"
            value={settings.alarm.snoozeMinutes}
            min={5}
            max={15}
            onChange={(v) =>
              void patch({ alarm: { ...settings.alarm, snoozeMinutes: v } })
            }
            display={`${settings.alarm.snoozeMinutes}m`}
          />
          <Slider
            label="Alarm volume"
            value={Math.round(settings.alarm.volume * 100)}
            min={10}
            max={100}
            onChange={(v) =>
              void patch({ alarm: { ...settings.alarm, volume: v / 100 } })
            }
            display={`${Math.round(settings.alarm.volume * 100)}%`}
          />
        </div>
        <label className="flex items-start gap-2 mt-4 text-sm">
          <input
            type="checkbox"
            className="mt-1 accent-indigo-glow"
            checked={settings.alarm.experimentalRestlessness}
            onChange={(e) =>
              void patch({
                alarm: {
                  ...settings.alarm,
                  experimentalRestlessness: e.target.checked,
                },
              })
            }
          />
          <span>
            Experimental: wake on mic/motion restlessness inside the window.
            <span className="block text-xs text-lavender/40 mt-1">
              Consumer sleep-stage detection is only ~66–79% accurate. Off by default.
            </span>
          </span>
        </label>
        <p className="text-xs text-warm/80 mt-4 leading-relaxed">
          Browser alarms need the tab open. Keep a backup phone alarm until a native
          (Capacitor) build with local notifications exists.
        </p>
      </Card>

      <Card>
        <CardTitle>Sleep sounds</CardTitle>
        <p className="text-xs text-lavender/50 mt-2">
          Lives inside Sleep Mode. Defaults to brown noise at an audible volume —
          adjust or mute it here.
        </p>
        <label className="flex items-center gap-2 mt-4 text-sm">
          <input
            type="checkbox"
            checked={settings.autoStartSound}
            onChange={(e) => void patch({ autoStartSound: e.target.checked })}
            className="accent-indigo-glow"
          />
          Auto-play when Sleep Mode opens
        </label>
        <div className="mt-4">
          <p className="text-sm text-lavender/70 mb-2">Preset</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {NOISE_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => {
                  void patch({ noisePreset: p.value })
                  if (noiseEngine.playing) void noiseEngine.setPreset(p.value)
                }}
                className={`text-left rounded-2xl px-3 py-3 border transition ${
                  settings.noisePreset === p.value
                    ? 'border-indigo-glow bg-indigo-glow/15'
                    : 'border-night-600 bg-night-700/40 hover:border-night-500'
                }`}
              >
                <p className="font-medium text-sm">{p.label}</p>
                <p className="text-[11px] text-lavender/50 mt-0.5">{p.hint}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
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
            display={
              settings.noiseVolume === 0
                ? 'Muted'
                : `${Math.round(settings.noiseVolume * 100)}%`
            }
          />
        </div>
        <div className="mt-4">
          <Slider
            label="Sleep timer fade-out"
            value={settings.noiseFadeOutMinutes}
            min={0}
            max={120}
            step={5}
            onChange={(v) => void patch({ noiseFadeOutMinutes: v })}
            display={
              settings.noiseFadeOutMinutes === 0
                ? 'Off'
                : `${settings.noiseFadeOutMinutes}m`
            }
          />
        </div>
      </Card>

      <Card>
        <CardTitle>Voice guidance</CardTitle>
        <p className="text-xs text-lavender/50 mt-2">
          Exercises and the ACT path can be read aloud, timed to each step.
        </p>
        {voiceSupported ? (
          <>
            <label className="flex items-center gap-2 mt-4 text-sm">
              <input
                type="checkbox"
                checked={settings.voiceOverEnabled}
                onChange={(e) => void patch({ voiceOverEnabled: e.target.checked })}
                className="accent-indigo-glow"
              />
              Speak exercise steps aloud
            </label>
            <div className="mt-4">
              <Slider
                label="Speech rate"
                value={Math.round(settings.voiceRate * 100)}
                min={70}
                max={125}
                step={5}
                onChange={(v) => void patch({ voiceRate: v / 100 })}
                display={`${(settings.voiceRate).toFixed(2)}x`}
              />
            </div>
          </>
        ) : (
          <p className="text-xs text-lavender/40 mt-3">
            This browser doesn’t support speech synthesis — exercises still work with
            on-screen text and timers.
          </p>
        )}
      </Card>

      <Card>
        <CardTitle>Display</CardTitle>
        <label className="flex items-center gap-2 mt-4 text-sm">
          <input
            type="checkbox"
            checked={settings.nightWarmOverlay}
            onChange={(e) => void patch({ nightWarmOverlay: e.target.checked })}
            className="accent-indigo-glow"
          />
          Warm night overlay (dimmer, amber tint)
        </label>
      </Card>

      <Card>
        <CardTitle>Values</CardTitle>
        <p className="text-xs text-lavender/50 mt-2 mb-3">
          Used when logging committed actions. Comma-separated.
        </p>
        <input
          className="w-full bg-night-700 border border-night-500/50 rounded-2xl px-4 py-3 text-sm"
          value={settings.values.join(', ')}
          onChange={(e) =>
            void patch({
              values: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </Card>

      <Card>
        <CardTitle>Data</CardTitle>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              void downloadExport().then(() => setMsg('Export downloaded.'))
            }
          >
            Export JSON
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Import JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return
              void importFromFile(f)
                .then(() => useSettingsStore.getState().load())
                .then(() => setMsg('Import complete.'))
                .catch(() => setMsg('Import failed.'))
            }}
          />
          <Button
            variant="danger"
            onClick={() => {
              if (
                confirm(
                  'Clear all local sleep data and reset settings? This cannot be undone.',
                )
              ) {
                void clearAllData()
                  .then(() => useSettingsStore.getState().load())
                  .then(() => setMsg('Data cleared.'))
              }
            }}
          >
            Reset all
          </Button>
        </div>
        {msg && <p className="text-xs text-success mt-3">{msg}</p>}
      </Card>

      <Card>
        <CardTitle>About</CardTitle>
        <p className="text-sm text-lavender/60 mt-2 leading-relaxed">
          ACT Sleep Companion is a self-help tool based on Acceptance and Commitment
          Therapy ideas for sleep — not therapy, diagnosis, or medical advice. If
          insomnia has lasted more than three months, talk with a clinician.
        </p>
        <p className="text-xs text-lavender/40 mt-3">
          Later: host the static <code className="text-violet-soft">dist/</code> build
          anywhere, or wrap with Capacitor for native alarms. See the README.
        </p>
        <Link to="/onboarding" className="inline-block mt-3">
          <Button variant="ghost" size="sm">
            Replay onboarding
          </Button>
        </Link>
      </Card>
    </div>
  )
}
