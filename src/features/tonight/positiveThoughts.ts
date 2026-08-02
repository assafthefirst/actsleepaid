/** Grounded, borrowable thoughts for the Tonight screen — optional, not prescriptive. */
export const DEFAULT_POSITIVE_THOUGHTS: string[] = [
  'One rough night doesn’t erase how capable I am.',
  'My body has recovered from bad sleep before — it can again.',
  'I don’t need a perfect night for tomorrow to go okay.',
  'This tiredness is uncomfortable, not dangerous.',
  'I can rest even if I can’t fully control sleep.',
  'Thoughts about not sleeping are just thoughts passing through.',
  'I’ve handled tired days before and gotten through them.',
  'Letting go of trying to sleep can help me sleep.',
  'Tomorrow-me can handle a slower morning.',
  'Quiet rest still counts, even without sleep.',
]

/** Fisher–Yates sample of `count` unique, non-empty strings from `pool`. */
export function sampleThoughts(pool: string[], count: number): string[] {
  const unique = Array.from(new Set(pool.map((p) => p.trim()).filter(Boolean)))
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[unique[i], unique[j]] = [unique[j], unique[i]]
  }
  return unique.slice(0, count)
}
