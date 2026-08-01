/**
 * Divides an exercise's total duration across its steps proportionally to
 * how much there is to say in each one (word count), so longer instructions
 * get more time and voice-over doesn't get cut off or stall on short steps.
 */
export function computeStepStarts(steps: string[], totalSeconds: number): number[] {
  const MIN_WORDS = 6
  const weights = steps.map((s) => Math.max(MIN_WORDS, s.trim().split(/\s+/).length))
  const sum = weights.reduce((a, b) => a + b, 0)

  const starts: number[] = []
  let acc = 0
  for (const w of weights) {
    starts.push(acc)
    acc += (w / sum) * totalSeconds
  }
  return starts
}

/** Index of the step active at `elapsedSeconds`, given cumulative start offsets. */
export function stepIndexAt(starts: number[], elapsedSeconds: number): number {
  let idx = 0
  for (let i = 0; i < starts.length; i++) {
    if (elapsedSeconds >= starts[i]) idx = i
  }
  return idx
}
