/**
 * Thin wrapper around the Screen Wake Lock API.
 *
 * Keeps the device screen from auto-locking while Sleep Mode is open, so the
 * alarm worker, its audio, and the noise engine keep running in the
 * foreground instead of being throttled by the OS/browser once the screen
 * turns off. The browser can revoke the lock at any time (e.g. the tab was
 * backgrounded), so we re-acquire it automatically once the page becomes
 * visible again.
 */
export class WakeLockController {
  private sentinel: WakeLockSentinel | null = null
  private wanted = false

  private onVisibilityChange = () => {
    if (this.wanted && document.visibilityState === 'visible') {
      void this.acquire()
    }
  }

  async acquire() {
    this.wanted = true
    if (this.sentinel) return
    try {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        this.sentinel = await navigator.wakeLock.request('screen')
        this.sentinel.addEventListener('release', () => {
          this.sentinel = null
        })
        document.addEventListener('visibilitychange', this.onVisibilityChange)
      }
    } catch {
      /* unsupported, permission denied, or low-power mode — degrade silently */
    }
  }

  async release() {
    this.wanted = false
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    try {
      await this.sentinel?.release()
    } catch {
      /* already released */
    }
    this.sentinel = null
  }

  get active() {
    return this.sentinel != null
  }
}

export const wakeLockController = new WakeLockController()
