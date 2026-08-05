import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardTitle } from '@/components/ui/Card'
import { Sheet } from '@/components/ui/Sheet'
import { Segmented } from '@/components/ui/Segmented'
import { EXERCISES, getExercise, type Exercise } from './exercises'
import { PATH_LESSONS, getPathLesson, type PathLesson } from './actPath'
import { ExercisePlayer } from './ExercisePlayer'
import { PathLessonPlayer } from './PathLessonPlayer'

type Tab = 'exercises' | 'path'

export function ExercisesPage() {
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>('exercises')
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null)
  const [activeLesson, setActiveLesson] = useState<PathLesson | null>(null)

  useEffect(() => {
    const id = params.get('exercise')
    if (id) {
      const ex = getExercise(id)
      if (ex) {
        setTab('exercises')
        setActiveExercise(ex)
      } else {
        const lesson = getPathLesson(id)
        if (lesson) {
          setTab('path')
          setActiveLesson(lesson)
        }
      }
      setParams({}, { replace: true })
    }
  }, [params, setParams])

  const library = EXERCISES

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
              Six story-based sessions — starting with the science of sleep, then
              walking through the core moves of ACT-for-insomnia. One part per day
              is plenty — each ends with a reflection that goes straight into your
              Thoughts log.
            </p>
          </Card>
          {PATH_LESSONS.map((lesson) => (
            <Card
              key={lesson.id}
              className="cursor-pointer hover:border-indigo-glow/40"
              onClick={() => setActiveLesson(lesson)}
            >
              <p className="text-xs text-violet-soft">Part {lesson.part}</p>
              <p className="font-medium mt-1">{lesson.title}</p>
              <p className="text-xs text-lavender/55 mt-1 italic">{lesson.theme}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Exercise player */}
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

      {/* Path lesson player */}
      <Sheet
        open={!!activeLesson}
        onClose={() => setActiveLesson(null)}
        title={activeLesson ? `Part ${activeLesson.part} · ${activeLesson.title}` : undefined}
      >
        {activeLesson && (
          <PathLessonPlayer
            lesson={activeLesson}
            onClose={() => setActiveLesson(null)}
          />
        )}
      </Sheet>
    </div>
  )
}
