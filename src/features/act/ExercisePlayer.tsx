import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import type { Exercise } from './exercises'
import { computeStepStarts, stepIndexAt } from './timeline'
import { Button } from '@/components/ui/Button'
import * as repo from '@/data/repo'
import { useSettings, useSettingsStore } from '@/app/settingsStore'
import { cancelSpeech, isVoiceSupported, speak } from '@/lib/voice'

type Props = {
  exercise: Exercise
  onClose: () => void
}

export function ExercisePlayer({ exercise, onClose }: Props) {
  const settings = useSettings()
  const patch = useSettingsStore((s) => s.patch)
  const voiceSupported = isVoiceSupported()

  const [remaining, setRemaining] = useState(exercise.durationSeconds)
  const [running, setRunning] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [startedAt] = useState(() => new Date().toISOString())
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in')

  const stepStarts = useMemo(
    () => computeStepStarts(exercise.steps, exercise.durationSeconds),
    [exercise],
  )

  const goToStep = (idx: number) => {
    const clamped = Math.max(0, Math.min(exercise.steps.length - 1, idx))
    setStepIdx(clamped)
    setRemaining(Math.max(0, Math.round(exercise.durationSeconds - stepStarts[clamped])))
  }

  useEffect(() => {
    if (!running) return
    if (remaining <= 0) {
      setRunning(false)
      void repo.addSession({
        exerciseId: exercise.id,
        startedAt,
        completedAt: new Date().toISOString(),
        durationSeconds: exercise.durationSeconds,
      })
      return
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [running, remaining, exercise, startedAt])

  // Auto-advance the visible step to match elapsed time, synced with narration.
  useEffect(() => {
    if (!running) return
    const elapsed = exercise.durationSeconds - remaining
    const idx = stepIndexAt(stepStarts, elapsed)
    setStepIdx((prev) => (prev === idx ? prev : idx))
  }, [remaining, running, stepStarts, exercise.durationSeconds])

  // Speak the current step whenever it becomes active while running.
  useEffect(() => {
    if (!running || !settings.voiceOverEnabled || !voiceSupported) return
    speak(exercise.steps[stepIdx], { rate: settings.voiceRate })
    return () => cancelSpeech()
  }, [stepIdx, running, settings.voiceOverEnabled, settings.voiceRate, voiceSupported, exercise.steps])

  useEffect(() => {
    if (!exercise.breathing || !running) return
    const id = setInterval(() => {
      setBreathPhase((p) => (p === 'in' ? 'out' : 'in'))
    }, 5000)
    return () => clearInterval(id)
  }, [exercise.breathing, running])

  useEffect(() => {
    return () => cancelSpeech()
  }, [])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-4xl font-light tabular-nums tracking-wider">
          {mm}:{ss}
        </p>
        <p className="text-sm text-lavender/60 mt-2">{exercise.title}</p>
      </div>

      {exercise.breathing && (
        <div className="flex justify-center py-4">
          <motion.div
            className="w-28 h-28 rounded-full bg-indigo-glow/30 border border-violet-soft/40"
            animate={{
              scale: breathPhase === 'in' ? 1.15 : 0.85,
              opacity: breathPhase === 'in' ? 1 : 0.7,
            }}
            transition={{ duration: 4.5, ease: 'easeInOut' }}
          />
        </div>
      )}

      <div className="rounded-2xl bg-night-700/50 p-4 min-h-[6rem]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-widest text-violet-soft/70">
            Step {stepIdx + 1} / {exercise.steps.length}
          </p>
          {voiceSupported && (
            <button
              type="button"
              onClick={() => void patch({ voiceOverEnabled: !settings.voiceOverEnabled })}
              className={`text-[11px] px-2 py-1 rounded-full border transition ${
                settings.voiceOverEnabled
                  ? 'border-indigo-glow bg-indigo-glow/20 text-mist'
                  : 'border-night-500 text-lavender/60'
              }`}
            >
              {settings.voiceOverEnabled ? '🔊 Voice on' : '🔇 Voice off'}
            </button>
          )}
        </div>
        <p className="text-sm leading-relaxed text-mist">
          {exercise.steps[stepIdx]}
        </p>
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="ghost"
            disabled={stepIdx === 0}
            onClick={() => goToStep(stepIdx - 1)}
          >
            Back
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={stepIdx >= exercise.steps.length - 1}
            onClick={() => goToStep(stepIdx + 1)}
          >
            Next step
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : remaining === 0 ? 'Done' : 'Start'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            cancelSpeech()
            setRemaining(exercise.durationSeconds)
            setRunning(false)
            setStepIdx(0)
          }}
        >
          Reset
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            cancelSpeech()
            onClose()
          }}
        >
          Close
        </Button>
      </div>

      {!voiceSupported && (
        <p className="text-[11px] text-lavender/40">
          Voice guidance isn’t supported in this browser — steps still advance on
          screen with the timer.
        </p>
      )}
    </div>
  )
}
