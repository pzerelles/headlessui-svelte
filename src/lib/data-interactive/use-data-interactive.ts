import { useActivePress } from "$lib/hooks/use-active-press.svelte.js"
import { useFocusRing } from "$lib/hooks/use-focus-ring.svelte.js"
import { useHover } from "$lib/hooks/use-hover.svelte.js"
import { mergeProps } from "$lib/utils/render.js"

type DataInteractiveRenderPropArg = {
  hover: boolean
  focus: boolean
  active: boolean
}

export const useDataInteractive = (evalDisabled: () => boolean) => {
  const disabled = $derived(evalDisabled())

  const { isHovered: hover, hoverProps } = $derived(
    useHover({
      get disabled() {
        return disabled
      },
    })
  )
  const { pressed: active, pressProps } = $derived(
    useActivePress({
      get disabled() {
        return disabled
      },
    })
  )
  const { isFocusVisible: focus, focusProps } = $derived(useFocusRing())

  const slot = $derived({
    hover,
    focus,
    active,
  } satisfies DataInteractiveRenderPropArg)

  const props = $derived(mergeProps(focusProps, hoverProps, pressProps))

  return {
    get slot() {
      return slot
    },
    get props() {
      return props
    },
  }
}
