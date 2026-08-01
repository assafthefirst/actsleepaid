import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardTitle } from '@/components/ui/Card'
import { Sheet } from '@/components/ui/Sheet'
import { Segmented } from '@/components/ui/Segmented'
import { EXERCISES, getExercise, type Exercise } from './exercises'
import { ExercisePlayer } from './ExercisePlayer'

type Tab = 'exercises' | 'path'

export function ExercisesPage() {
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>('exercises')
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null)

  useEffect(() => {
    const ex = params.get('exercise')
    if (ex) {
      const found = getExercise(ex)
      if (found) {
        setTab(found.category === 'path' ? 'path' : 'exercises')
        setActiveExercise(found)
        setParams({}, { replace: true })
      }
    }
  }, [params, setParams])

  const pathExercises = useMemo(
    () => EXERCISES.filter((e) => e.category === 'path'),
    [],
  )
  const library = useMemo(() => EXERCISES.filter((e) => e.category !== 'path'), [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Exercises</h1>
        <p className="text-sm text-lavender/60 mt-1">
          Defusion, acceptance, and present-moment practices — with spoken guidance.
        </p>
      </div>

      <Segmented<Tab>
        ariaLabel="Exercises sections"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'exercises', label: 'Exercises' },
          { value: 'path', label: 'ACT path' },
        ]}
      />

      {tab === 'exercises' && (
        <div className="space-y-3">
          {library.map((ex) => (
            <Card
              key={ex.id}
              className="cursor-pointer hover:border-indigo-glow/40"
              onClick={() => setActiveExercise(ex)}
            >
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-medium">{ex.title}</p>
                  <p className="text-xs text-lavender/55 mt-1">{ex.summary}</p>
                </div>
                <span className="text-xs text-violet-soft tabular-nums shrink-0">
                  {Math.round(ex.durationSeconds / 60)}m
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'path' && (
        <div className="space-y-3">
          <Card>
            <CardTitle>Guided ACT-I arc</CardTitle>
            <p className="text-sm text-lavender/60 mt-2 leading-relaxed">
              Five short sessions mirroring common ACT-for-insomnia structure.
              Go at your pace — one part per day is plenty.
            </p>
          </Card>
          {pathExercises.map((ex, i) => (
            <Card
              key={ex.id}
              className="cursor-pointer hover:border-indigo-glow/40"
              onClick={() => setActiveExercise(ex)}
            >
              <p className="text-xs text-violet-soft">Part {i + 1}</p>
              <p className="font-medium mt-1">{ex.title}</p>
              <p className="text-xs text-lavender/55 mt-1">{ex.summary}</p>
            </Card>
          ))}
        </div>
      )}

      <Sheet
        open={!!activeExercise}
        onClose={() => setActiveExercise(null)}
        title={activeExercise?.title}
      >
        {activeExercise && (
          <ExercisePlayer
            exercise={activeExercise}
            onClose={() => setActiveExercise(null)}
          />
        )}
      </Sheet>
    </div>
  )
}
