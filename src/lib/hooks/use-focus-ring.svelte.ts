import { isFocusVisible, useFocusVisibleListener } from "../utils/focusVisible.svelte.js"

export const useFocusRing = (options: { autofocus?: boolean; within?: boolean } = {}) => {
  const { autofocus, within } = $derived(options)

  let focused = $state(false)
  let _isFocusVisible = $state((() => autofocus || isFocusVisible())())

  useFocusVisibleListener((isFocusVisible) => {
    _isFocusVisible = isFocusVisible
  })

  return {
    get isFocusVisible() {
      return _isFocusVisible && focused
    },
    focusProps: {
      onfocus: () => {
        if (!within) focused = true
      },
      onblur: () => {
        if (!within) focused = false
      },
    },
  }
}
