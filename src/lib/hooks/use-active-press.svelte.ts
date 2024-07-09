import { disposables } from "../utils/disposables.js"
import { getOwnerDocument } from "../utils/owner.js"

// Only the necessary props from a DOMRect
type Rect = { left: number; right: number; top: number; bottom: number }

function pointerRectFromPointerEvent(event: PointerEvent): Rect {
  // Center of the pointer geometry
  const offsetX = event.width / 2
  const offsetY = event.height / 2

  return {
    top: event.clientY - offsetY,
    right: event.clientX + offsetX,
    bottom: event.clientY + offsetY,
    left: event.clientX - offsetX,
  }
}

function areRectsOverlapping(a: Rect | null, b: Rect | null) {
  if (!a || !b) {
    return false
  }

  if (a.right < b.left || a.left > b.right) {
    return false
  }

  if (a.bottom < b.top || a.top > b.bottom) {
    return false
  }

  return true
}

export const useActivePress = (options: { disabled?: boolean }) => {
  const { disabled } = $derived(options)
  let currentTarget = $state<HTMLElement | null>(null)
  let pressed = $state(false)

  const d = disposables()

  const reset = () => {
    currentTarget = null
    pressed = false
    d.dispose()
  }

  const handlePointerDown = (event: PointerEvent) => {
    d.dispose() // Cancel any scheduled tasks

    if (currentTarget !== null) return

    // Keep track of the current element
    currentTarget = event.currentTarget as HTMLElement

    // We are definitely pressing the element now
    pressed = true

    // Setup global handlers to catch events on elements that are not the current element
    {
      const owner = getOwnerDocument(event.currentTarget as Element | null | undefined)

      if (owner) {
        // `pointerup` on any element means that we are no longer pressing the current element
        d.addEventListener(owner, "pointerup", reset, false)

        // `pointerleave` isn't called consistently (if at all) on iOS Safari, so we use `pointermove` instead
        // to determine if we are still "pressing". We also compare the pointer position to the target element
        // so that we can tell if the pointer is still over the element or not.
        d.addEventListener(
          owner,
          "pointermove",
          (event: PointerEvent) => {
            if (currentTarget) {
              const pointerRect = pointerRectFromPointerEvent(event)
              pressed = areRectsOverlapping(pointerRect, currentTarget.getBoundingClientRect())
            }
          },
          false
        )

        // Whenever the browser decides to fire a `pointercancel` event, we should abort
        d.addEventListener(owner, "pointercancel", reset, false)
      }
    }
  }

  return {
    get pressed() {
      return pressed
    },
    get pressProps() {
      return disabled
        ? {}
        : {
            onpointerdown: handlePointerDown,
            onpointerup: reset,
            onclick: reset,
          }
    },
  }
}
