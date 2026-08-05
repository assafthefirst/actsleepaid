export type ExerciseId =
  | 'dropping-anchor-40s'
  | 'dropping-anchor-2m'
  | 'dropping-anchor-7m'
  | 'leaves-on-a-stream'
  | 'struggle-switch'
  | 'thanking-your-mind'
  | 'passengers-on-the-bus'
  | 'paced-breathing'
  | 'body-scan'

export interface Exercise {
  id: ExerciseId
  title: string
  durationSeconds: number
  category: 'defusion' | 'acceptance' | 'present' | 'values'
  summary: string
  steps: string[]
  breathing?: boolean
}

export const EXERCISES: Exercise[] = [
  {
    id: 'dropping-anchor-40s',
    title: 'Dropping anchor (40s)',
    durationSeconds: 40,
    category: 'present',
    summary: 'Acknowledge → Come back to body → Engage. Best for 3 a.m. spikes.',
    steps: [
      'Acknowledge: silently name what shows up — “worrying,” “tight chest,” “I’m having the thought that I won’t sleep.”',
      'Come back: press feet into the bed or floor; feel the contact. Slow breath out.',
      'Engage: notice three things you can hear or feel right now. Stay with the night as it is.',
    ],
  },
  {
    id: 'dropping-anchor-2m',
    title: 'Dropping anchor (2 min)',
    durationSeconds: 120,
    category: 'present',
    summary: 'A fuller ACE cycle when you have a couple of minutes.',
    steps: [
      'Acknowledge thoughts and feelings with curiosity, not a fight.',
      'Come into the body: jaw, shoulders, hands, belly. Soften where you can.',
      'Engage with the room: light, temperature, fabric, distant sounds.',
      'If the mind pulls you back into sleep struggle, gently re-anchor.',
    ],
  },
  {
    id: 'dropping-anchor-7m',
    title: 'Dropping anchor (7 min)',
    durationSeconds: 420,
    category: 'present',
    summary: 'Longer practice to train the skill before bedtime.',
    steps: [
      'Settle into a comfortable position. Eyes soft or closed.',
      'For a minute, simply notice whatever thoughts arrive — no fixing.',
      'Scan the body from feet to head, naming sensations.',
      'Widen attention to the room and the present moment.',
      'End by choosing one small, workable next action (or rest).',
    ],
  },
  {
    id: 'leaves-on-a-stream',
    title: 'Leaves on a stream',
    durationSeconds: 600,
    category: 'defusion',
    summary: 'Place each thought on a leaf and let the stream carry it.',
    steps: [
      'Imagine a gentle stream with leaves floating by.',
      'When a thought appears, place it on a leaf — don’t argue with it.',
      'Watch it drift. If you get hooked, notice that, and place “getting hooked” on a leaf too.',
      'Continue for the timer. Thoughts can return; you can place them again.',
    ],
  },
  {
    id: 'struggle-switch',
    title: 'The struggle switch',
    durationSeconds: 180,
    category: 'acceptance',
    summary: 'Notice how fighting wakefulness can amplify it.',
    steps: [
      'Recall a recent night of trying hard to force sleep.',
      'Picture a switch: ON = struggle (tense, clock-watch, argue with thoughts).',
      'Feel what “ON” does in your body.',
      'Imagine flipping it OFF — not to sleep, but to stop the extra struggle layer.',
      'Willingness: “I can have wakefulness without needing to win against it.”',
    ],
  },
  {
    id: 'thanking-your-mind',
    title: 'Thanking your mind',
    durationSeconds: 120,
    category: 'defusion',
    summary: 'Quick defusion for “I’ll never cope tomorrow.”',
    steps: [
      'Catch the thought. Say silently: “Thanks, mind — you’re trying to protect me.”',
      'Add: “I’m having the thought that…”',
      'Ask: what valued action (or rest) matters in the next minute?',
      'Return attention to breath or the room.',
    ],
  },
  {
    id: 'passengers-on-the-bus',
    title: 'Passengers on the bus',
    durationSeconds: 240,
    category: 'defusion',
    summary: 'You drive; noisy passengers don’t choose the route.',
    steps: [
      'You are the bus driver. Thoughts and feelings are passengers.',
      'Some shout: “Turn around — you can’t function tomorrow.”',
      'You can hear them without handing them the wheel.',
      'Choose a direction that serves a value (rest, kindness, showing up).',
      'Keep driving — passengers may stay loud; that’s allowed.',
    ],
  },
  {
    id: 'paced-breathing',
    title: 'Paced breathing',
    durationSeconds: 180,
    category: 'present',
    summary: 'Slow exhale-biased breathing to settle arousal.',
    breathing: true,
    steps: [
      'Inhale gently through the nose for ~4 seconds.',
      'Exhale slowly for ~6 seconds.',
      'If dizzy, return to your natural breath.',
      'Let thoughts come and go while you stay with the rhythm.',
    ],
  },
  {
    id: 'body-scan',
    title: 'Body scan',
    durationSeconds: 480,
    category: 'present',
    summary: 'Move attention through the body without fixing sensations.',
    steps: [
      'Start at the feet. Notice temperature, pressure, tingling.',
      'Move slowly up: legs, hips, belly, chest, arms, face.',
      'Where there’s tightness, breathe toward it — not to erase it.',
      'End with the whole body as one field of sensation.',
    ],
  },
]

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id)
}
