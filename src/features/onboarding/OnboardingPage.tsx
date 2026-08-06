import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '@/app/settingsStore'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TimePicker } from '@/components/ui/TimePicker'
import { Slider } from '@/components/ui/Slider'
import { formatDuration, deriveWakeMinutes } from '@/lib/time'

const STEPS = ['welcome', 'schedule', 'act', 'safety'] as const

export function OnboardingPage() {
  const navigate = useNavigate()
  const settings = useSettingsStore((s) => s.settings)
  const patch = useSettingsStore((s) => s.patch)
  const [step, setStep] = useState(0)

  const finish = async () => {
    await patch({ onboardingComplete: true })
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-8 bg-night-900">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-violet-soft/70">
            ACT Sleep Companion
          </p>
          <div className="flex justify-center gap-1.5 mt-4">
            {STEPS.map((_, i) => (
              <span
                key={STEPS[i]}
                className={`h-1.5 w-8 rounded-full ${
                  i <= step ? 'bg-indigo-glow' : 'bg-night-600'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 0 && (
          <Card className="space-y-4">
            <h1 className="text-2xl font-semibold">A quieter way to meet the night</h1>
            <p className="text-sm text-lavender/70 leading-relaxed">
              Track a wind-down routine, notice sticky sleep thoughts without fighting
              them, play soft noise, and wake inside a gentle window — all private on
              this device.
            </p>
            <p className="text-sm text-lavender/70 leading-relaxed">
              Built around Acceptance and Commitment Therapy: less struggle with sleep,
              more contact with what matters.
            </p>
            <Button className="w-full" onClick={() => setStep(1)}>
              Continue
            </Button>
          </Card>
        )}

        {step === 1 && (
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold">Your sleep window</h2>
            <TimePicker
              label="Usual bedtime"
              valueMinutes={settings.bedtimeMinutes}
              onChange={(m) => {
                const wake = deriveWakeMinutes(m, settings.sleepWindowMinutes)
                void patch({ bedtimeMinutes: m, wakeMinutes: wake, alarm: { ...settings.alarm, wakeMinutes: wake } })
              }}
            />
            <TimePicker
              label="Usual wake time"
              valueMinutes={settings.wakeMinutes}
              onChange={(m) =>
                void patch({
                  wakeMinutes: m,
                  alarm: { ...settings.alarm, wakeMinutes: m },
                })
              }
            />
            <p className="text-[11px] text-lavender/45 -mt-2">
              Wake auto-sets from bedtime + window — adjust freely.
            </p>
            <Slider
              label="Target time in bed"
              value={settings.sleepWindowMinutes}
              min={300}
              max={600}
              step={15}
              onChange={(v) => {
                const wake = deriveWakeMinutes(settings.bedtimeMinutes, v)
                void patch({ sleepWindowMinutes: v, targetSleepMinutes: v, wakeMinutes: wake, alarm: { ...settings.alarm, wakeMinutes: wake } })
              }}
              display={formatDuration(settings.sleepWindowMinutes)}
            />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold">Thoughts, not replacements</h2>
            <p className="text-sm text-lavender/70 leading-relaxed">
              When insomnia thoughts show up, this app helps you{' '}
              <em>notice and unhook</em> — “I’m having the thought that…” — then choose
              a small action tied to a value.
            </p>
            <p className="text-sm text-lavender/70 leading-relaxed">
              That is different from forcing a “positive” replacement thought. An
              optional workable response field is there when you want one, framed as a
              response, not a rewrite.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold">A few honest limits</h2>
            <ul className="text-sm text-lavender/70 space-y-2 list-disc pl-5 leading-relaxed">
              <li>
                This is a self-help companion — not therapy, diagnosis, or medical care.
              </li>
              <li>
                If insomnia has lasted over three months, consider a clinician (CBT-I /
                ACT-informed care).
              </li>
              <li>
                Sleep Mode alarms need the tab open. Keep a backup phone alarm.
              </li>
              <li>All data stays in this browser unless you export it.</li>
            </ul>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => void finish()}>
                Enter the app
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
