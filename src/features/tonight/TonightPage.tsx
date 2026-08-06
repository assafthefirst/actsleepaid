import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings, useSettingsStore } from '@/app/settingsStore'
import * as repo from '@/data/repo'
import { buildTonightSchedule, nextStep, currentStep } from '@/lib/schedule'
import {
  formatClock,
  formatDuration,
  isWeekend,
  minutesToHHMM,
  todayISODate,
} from '@/lib/time'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TimePicker } from '@/components/ui/TimePicker'
import { SleepMode } from './SleepMode'
import { PositiveThoughtsCard } from './PositiveThoughtsCard'
import { SleepWindowInvitation } from '@/features/diary/SleepWindowInvitation'

// After this hour, always show the wind-down timeline regardless of daytime tasks.
const WIND_DOWN_HOUR = 19

export function TonightPage() {
  const settings = useSettings()
  const patch = useSettingsStore((s) => s.patch)
  const [now, setNow] = useState(() => new Date())
  const [sleepMode, setSleepMode] = useState(false)
  const [loggedToday, setLoggedToday] = useState<boolean | null>(null)
  const [exercisedToday, setExercisedToday] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const today = todayISODate()
    let cancelled = false
    void Promise.all([repo.getSleepLogByDate(today), repo.listSessions(20)]).then(
      ([log, sessions]) => {
        if (cancelled) return
        setLoggedToday(!!log)
        setExercisedToday(sessions.some((s) => s.startedAt.slice(0, 10) === today))
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  const logExerciseNow = async () => {
    const iso = new Date().toISOString()
    await repo.addSession({
      exerciseId: 'logged-elsewhere',
      startedAt: iso,
      completedAt: iso,
      durationSeconds: 0,
    })
    setExercisedToday(true)
  }

  const weekend = settings.useWeekendSchedule && isWeekend(now)
  const bedtime = weekend ? settings.weekendBedtimeMinutes : settings.bedtimeMinutes
  const wake = weekend ? settings.weekendWakeMinutes : settings.wakeMinutes

  const schedule = useMemo(
    () =>
      buildTonightSchedule({
        bedtimeMinutes: bedtime,
        wakeMinutes: wake,
        targetSleepMinutes: settings.sleepWindowMinutes || settings.targetSleepMinutes,
        expectedLatencyMinutes: settings.expectedLatencyMinutes,
        caffeineDoseMg: settings.caffeineDoseMg,
        chronotype: settings.chronotype,
        now,
      }),
    [bedtime, wake, settings, now],
  )

  const upcoming = nextStep(schedule, now)
  const current = currentStep(schedule, now)

  const isDaytime = now.getHours() < WIND_DOWN_HOUR
  const dayTask: 'log' | 'exercise' | null =
    isDaytime && loggedToday !== null
      ? !loggedToday
        ? 'log'
        : !exercisedToday
          ? 'exercise'
          : null
      : null

  if (sleepMode) {
    return <SleepMode schedule={schedule} onExit={() => setSleepMode(false)} />
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tonight</h1>
        <p className="text-lavender/60 text-sm mt-1">
          {weekend ? 'Weekend schedule' : 'Weekday schedule'} · target{' '}
          {formatDuration(settings.sleepWindowMinutes)}
        </p>
      </div>

      <SleepWindowInvitation />

      <Card className="bg-gradient-to-br from-night-800 to-night-700/40">
        <div className="flex flex-wrap gap-6 items-end justify-between">
          <div>
            <CardTitle>Lights out</CardTitle>
            <p className="text-4xl font-semibold tabular-nums mt-2 text-mist">
              {schedule.bedtimeLabel}
            </p>
          </div>
          <div className="text-right">
            <CardTitle>Wake window</CardTitle>
            <p className="text-2xl font-semibold tabular-nums mt-2">
              {formatClock(schedule.wake.windowStart)} –{' '}
              {formatClock(schedule.wake.windowEnd)}
            </p>
            <p className="text-xs text-lavender/50 mt-1 max-w-[16rem]">
              Mid {formatClock(schedule.wake.mid)}
            </p>
          </div>
        </div>
        <p className="text-xs text-lavender/45 mt-4 leading-relaxed">
          {schedule.wake.note}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => setSleepMode(true)} size="lg">
            Enter Sleep Mode
          </Button>
        </div>
        <p className="text-xs text-lavender/40 mt-3">
          Sleep sounds ({settings.noisePreset}) start automatically in Sleep Mode.
        </p>
      </Card>

      {dayTask === 'log' && (
        <Card className="ring-1 ring-indigo-glow/30">
          <CardTitle>Next</CardTitle>
          <p className="text-xl font-medium mt-2">Log last night</p>
          <p className="text-sm text-lavender/60 mt-1">
            A quick morning check-in keeps your schedule and sleep window accurate.
          </p>
          <Link to="/diary">
            <Button className="mt-4">Log last night</Button>
          </Link>
        </Card>
      )}

      {dayTask === 'exercise' && (
        <Card className="ring-1 ring-indigo-glow/30">
          <CardTitle>Next</CardTitle>
          <p className="text-xl font-medium mt-2">Do a short exercise</p>
          <p className="text-sm text-lavender/60 mt-1">
            Last night’s logged. A few minutes of practice during the day builds the
            skill for when it matters most.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link to="/exercises">
              <Button>Do an exercise</Button>
            </Link>
            <Button variant="ghost" onClick={() => void logExerciseNow()}>
              I already did one
            </Button>
          </div>
        </Card>
      )}

      {dayTask === null && upcoming && (
        <Card>
          <CardTitle>Next</CardTitle>
          <p className="text-xl font-medium mt-2">{upcoming.title}</p>
          <p className="text-sm text-lavender/60 mt-1">{upcoming.detail}</p>
          <p className="text-violet-soft tabular-nums mt-3 text-sm">
            at {upcoming.label} · in{' '}
            {formatDuration(
              Math.max(0, (upcoming.at.getTime() - now.getTime()) / 60_000),
            )}
          </p>
        </Card>
      )}

      {dayTask === null && !upcoming && current && (
        <Card>
          <CardTitle>Current</CardTitle>
          <p className="text-xl font-medium mt-2">{current.title}</p>
          <p className="text-sm text-lavender/60 mt-1">{current.detail}</p>
        </Card>
      )}

      <PositiveThoughtsCard />

      <Card>
        <CardTitle>Wind-down timeline</CardTitle>
        <ol className="mt-4 space-y-3">
          {schedule.windDown.map((step) => {
            const done = step.at.getTime() <= now.getTime()
            const isNext = upcoming?.id === step.id
            return (
              <li
                key={step.id}
                className={`flex gap-3 items-start rounded-2xl px-3 py-2.5 ${
                  isNext
                    ? 'bg-indigo-glow/15 ring-1 ring-indigo-glow/40'
                    : done
                      ? 'opacity-45'
                      : 'bg-night-700/30'
                }`}
              >
                <span className="tabular-nums text-sm text-violet-soft w-12 shrink-0 pt-0.5">
                  {step.label}
                </span>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-lavender/55 mt-0.5 leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </Card>

      <Card>
        <CardTitle>Adjust tonight</CardTitle>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TimePicker
            label={weekend ? 'Weekend bedtime' : 'Bedtime'}
            valueMinutes={bedtime}
            onChange={(m) =>
              void patch(
                weekend
                  ? { weekendBedtimeMinutes: m }
                  : { bedtimeMinutes: m },
              )
            }
          />
          <TimePicker
            label={weekend ? 'Weekend wake' : 'Wake target'}
            valueMinutes={wake}
            onChange={(m) =>
              void patch(
                weekend ? { weekendWakeMinutes: m } : { wakeMinutes: m },
              )
            }
          />
        </div>
        <p className="text-xs text-lavender/45 mt-3">
          Alarm targets {minutesToHHMM(settings.alarm.wakeMinutes)}. Sync in{' '}
          <Link to="/settings" className="text-violet-soft underline">
            Settings
          </Link>
          .
        </p>
      </Card>
    </div>
  )
}
