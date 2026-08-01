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
  | 'path-1'
  | 'path-2'
  | 'path-3'
  | 'path-4'
  | 'path-5'

export interface Exercise {
  id: ExerciseId
  title: string
  durationSeconds: number
  category: 'defusion' | 'acceptance' | 'present' | 'values' | 'path'
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
  {
    id: 'path-1',
    title: 'Path 1 · Giving up the struggle',
    durationSeconds: 300,
    category: 'path',
    summary: 'Creative hopelessness: control strategies that backfired.',
    steps: [
      'List ways you’ve tried to force sleep (counting, clock-checking, alcohol, scrolling).',
      'Honestly: what did each cost you? What did it deliver?',
      'Notice the possibility that more control isn’t the missing piece.',
      'Open a little to: “Maybe I can stop fighting sleep tonight.”',
    ],
  },
  {
    id: 'path-2',
    title: 'Path 2 · Observer perspective',
    durationSeconds: 300,
    category: 'path',
    summary: 'Self-as-context: you are more than tonight’s thoughts.',
    steps: [
      'Notice a sleep thought. Then notice the part of you that notices.',
      'That observing vantage has been there across many nights.',
      'Thoughts and feelings move; the observing space remains.',
      'Rest in that space for a few breaths.',
    ],
  },
  {
    id: 'path-3',
    title: 'Path 3 · Acceptance',
    durationSeconds: 300,
    category: 'path',
    summary: 'Willingness to have wakefulness without the extra war.',
    steps: [
      'Invite in the sensations of being awake — even if unwanted.',
      'Rate willingness 0–10 to have them for the next minute.',
      'See if you can raise willingness by 1 without liking the feelings.',
      'Willingness is a choice about struggle, not about liking insomnia.',
    ],
  },
  {
    id: 'path-4',
    title: 'Path 4 · Defusion',
    durationSeconds: 300,
    category: 'path',
    summary: 'Change your relationship to sleep thoughts.',
    steps: [
      'Pick a sticky thought. Repeat: “I’m having the thought that…”',
      'Try thanking your mind, or placing it on a leaf.',
      'Ask: if I weren’t fused with this, what would I do with my hands/eyes next?',
      'Practice once more with a second thought.',
    ],
  },
  {
    id: 'path-5',
    title: 'Path 5 · Values & committed action',
    durationSeconds: 300,
    category: 'path',
    summary: 'Reconnect daytime life to what matters beyond sleep.',
    steps: [
      'Name one value that sleep serves (presence, craft, care, play).',
      'Choose one small daytime action that expresses it — even after a rough night.',
      'Write the action in your thought log as a committed step.',
      'Sleep becomes a passenger; values keep the wheel.',
    ],
  },
]

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id)
}
