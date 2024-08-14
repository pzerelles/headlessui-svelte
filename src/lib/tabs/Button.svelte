<script lang="ts" context="module">
  import type { SvelteHTMLElements } from "svelte/elements"

  export type ButtonProps<TTag extends keyof SvelteHTMLElements = typeof DEFAULT_BUTTON_TAG> =
    SvelteHTMLElements[TTag] & {
      as?: TTag
      disabled?: boolean
      autofocus?: boolean
      type?: "button" | "submit" | "reset"
      children?: Snippet<
        [
          {
            disabled: boolean
            hover: boolean
            focus: boolean
            active: boolean
            autofocus: boolean
          },
        ]
      >
    }

  const DEFAULT_BUTTON_TAG = "button" as const
</script>

<script lang="ts" generics="TTag extends keyof SvelteHTMLElements, TType">
  import type { Snippet } from "svelte"
  import { useActivePress } from "../hooks/use-active-press.svelte.js"
  import { useFocusRing } from "../hooks/use-focus-ring.svelte.js"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { stateFromSlot } from "../utils/state.js"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const providedDisabled = useDisabled()

  let {
    ref = $bindable(),
    disabled: ownDisabled = false,
    autofocus = false,
    type = "button",
    ...theirProps
  }: ButtonProps<TTag> = $props()

  const disabled = $derived(providedDisabled.value || ownDisabled)

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
  const { isFocusVisible: focus, focusProps } = $derived(
    useFocusRing({
      get autofocus() {
        return autofocus
      },
    })
  )

  const slot = $derived({
    disabled,
    hover,
    focus,
    active,
    autofocus,
  })

  const ourProps = $derived(
    mergeProps(
      {
        type,
        disabled: disabled || undefined,
        autofocus,
      },
      focusProps,
      hoverProps,
      pressProps,
      stateFromSlot(slot)
    )
  )
</script>

<ElementOrComponent {ourProps} {theirProps} {slot} defaultTag={DEFAULT_BUTTON_TAG} name="Button" bind:ref />
