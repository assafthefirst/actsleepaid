import { useRef } from 'react'
import type { MouseEvent } from 'react'

/** Returns long-press event handlers (500 ms hold) for a single element. */
export function useLongPress(onLongPress: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancel = () => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }
  return {
    onPointerDown: () => {
      timer.current = setTimeout(onLongPress, 500)
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    // Desktop right-click / Android long-press
    onContextMenu: (e: MouseEvent) => {
      e.preventDefault()
      cancel()
      onLongPress()
    },
  }
}
