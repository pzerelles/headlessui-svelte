import type { Action } from "svelte/action"
import { isFocusVisible, useFocusVisibleListener } from "../utils/focusVisible.svelte.js"

export const createFocusRing = ({ autofocus = false, within }: { autofocus?: boolean; within?: boolean } = {}) => {
  let focused = $state(false)
  let focusVisible = $state(autofocus || isFocusVisible())

  useFocusVisibleListener((isFocusVisible) => {
    focusVisible = isFocusVisible
  })

  const focusRingAction: Action<HTMLElement> = (node) => {
    const handleFocus = (e: FocusEvent) => {
      focused = true
    }
    const handleBlur = (e: FocusEvent) => {
      focused = false
    }

    if (!within) {
      node.addEventListener("focus", handleFocus)
      node.addEventListener("blur", handleBlur)
    }

    return {
      destroy: () => {
        if (!within) {
          node.removeEventListener("focus", handleFocus)
          node.removeEventListener("blur", handleBlur)
        }
      },
    }
  }

  return {
    focusRingAction,
    get focusVisible() {
      return focusVisible && focused
    },
  }
}
