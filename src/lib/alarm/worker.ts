/// Worker that ticks every second with drift correction.
/// Posts { type: 'tick', now: number } and { type: 'fire', reason: string }

let intervalId: ReturnType<typeof setInterval> | null = null
let targetFireAt: number | null = null
let windowStartAt: number | null = null
let fired = false

function clear() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

self.onmessage = (e: MessageEvent) => {
  const data = e.data as
    | { type: 'arm'; windowStart: number; fireAt: number }
    | { type: 'disarm' }
    | { type: 'ping' }

  if (data.type === 'disarm') {
    clear()
    targetFireAt = null
    windowStartAt = null
    fired = false
    return
  }

  if (data.type === 'ping') {
    self.postMessage({ type: 'tick', now: Date.now() })
    return
  }

  if (data.type === 'arm') {
    clear()
    windowStartAt = data.windowStart
    targetFireAt = data.fireAt
    fired = false

    const tick = () => {
      const now = Date.now()
      self.postMessage({ type: 'tick', now })

      if (fired || targetFireAt == null) return

      if (now >= targetFireAt) {
        fired = true
        self.postMessage({ type: 'fire', reason: 'target', now })
        return
      }

      // Soft signal once we're inside the wake window (for restlessness mode)
      if (windowStartAt != null && now >= windowStartAt && now < targetFireAt) {
        self.postMessage({ type: 'window', now })
      }
    }

    // Drift-corrected: schedule relative to wall clock
    intervalId = setInterval(tick, 1000)
    tick()
  }
}

export {}
