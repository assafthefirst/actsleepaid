import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { PathLesson } from './actPath'
import * as repo from '@/data/repo'
import { Button } from '@/components/ui/Button'

type Phase = 'story' | 'reflect' | 'saved'

type Props = {
  lesson: PathLesson
  onClose: () => void
}

export function PathLessonPlayer({ lesson, onClose }: Props) {
  const [sectionIdx, setSectionIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('story')
  const [learning, setLearning] = useState('')
  const [action, setAction] = useState('')
  const [saving, setSaving] = useState(false)

  const total = lesson.story.length
  const section = lesson.story[sectionIdx]
  const isLast = sectionIdx === total - 1

  const next = () => {
    if (isLast) {
      setPhase('reflect')
    } else {
      setSectionIdx((i) => i + 1)
    }
  }

  const back = () => {
    if (phase === 'reflect') {
      setPhase('story')
    } else {
      setSectionIdx((i) => Math.max(0, i - 1))
    }
  }

  const save = async () => {
    const text = learning.trim()
    if (!text) return
    setSaving(true)
    try {
      const iso = new Date().toISOString()
      await Promise.all([
        repo.addThoughtLog({
          thought: `Part ${lesson.part}: ${lesson.title}`,
          defused: `I'm having the insight that ${text}`,
          pattern: 'other',
          willingness: 5,
          committedAction: action.trim() || undefined,
          workableResponse: text,
        }),
        repo.addSession({
          exerciseId: lesson.id,
          startedAt: iso,
          completedAt: iso,
          durationSeconds: 0,
        }),
      ])
      setPhase('saved')
    } finally {
      setSaving(false)
    }
  }

  if (phase === 'saved') {
    return (
      <div className="space-y-5 text-center py-4">
        <p className="text-3xl">✓</p>
        <p className="text-lg font-medium text-mist">Saved to your thoughts</p>
        <p className="text-sm text-lavender/60 leading-relaxed max-w-xs mx-auto">
          Your learning is now part of the pool in "Helpful thoughts" on the Tonight screen.
        </p>
        <p className="text-xs text-lavender/40 italic leading-relaxed">
          {lesson.closingThought}
        </p>
        <Button className="w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    )
  }

  if (phase === 'reflect') {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-violet-soft/70 mb-1">
            Part {lesson.part} · Reflect
          </p>
          <h3 className="text-lg font-semibold text-mist">{lesson.title}</h3>
        </div>

        <div className="rounded-2xl bg-night-700/50 p-4">
          <p className="text-sm text-lavender/70 leading-relaxed italic">
            {lesson.reflectionPrompt}
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-lavender/70">What landed for you?</span>
          <textarea
            value={learning}
            onChange={(e) => setLearning(e.target.value)}
            rows={4}
            autoFocus
            placeholder="Write what resonated — a sentence is enough"
            className="bg-night-700 border border-night-500/50 rounded-2xl px-4 py-3 text-sm resize-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-lavender/70">
            One thing I'll try tomorrow{' '}
            <span className="text-lavender/40">(optional)</span>
          </span>
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="e.g. notice when the second fight starts"
            className="bg-night-700 border border-night-500/50 rounded-2xl px-4 py-3 text-sm"
          />
        </label>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={back}
          >
            ← Back
          </Button>
          <Button
            className="flex-1"
            disabled={!learning.trim() || saving}
            onClick={() => void save()}
          >
            {saving ? 'Saving…' : 'Save learning'}
          </Button>
        </div>
        <Button variant="ghost" className="w-full text-lavender/50" onClick={onClose}>
          Skip for now
        </Button>
      </div>
    )
  }

  // story phase
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-violet-soft/70">
            Part {lesson.part}
          </p>
          <h3 className="text-base font-semibold text-mist mt-0.5">{lesson.title}</h3>
        </div>
        <p className="text-xs text-lavender/40 tabular-nums">
          {sectionIdx + 1} / {total}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {lesson.story.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i <= sectionIdx ? 'bg-violet-soft' : 'bg-night-600'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={sectionIdx}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl bg-night-700/50 p-5 min-h-[14rem]"
        >
          <p className="text-xs uppercase tracking-widest text-violet-soft/60 mb-3">
            {section.heading}
          </p>
          <p className="text-sm leading-loose text-mist whitespace-pre-line">
            {section.body}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          disabled={sectionIdx === 0}
          onClick={back}
        >
          ← Back
        </Button>
        <Button className="flex-1" onClick={next}>
          {isLast ? 'Reflect →' : 'Continue →'}
        </Button>
      </div>

      <Button variant="ghost" className="w-full text-lavender/50" onClick={onClose}>
        Close
      </Button>
    </div>
  )
}
