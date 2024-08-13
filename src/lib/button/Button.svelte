<script lang="ts" context="module">
  import type { SvelteHTMLElements } from "svelte/elements"

  const DEFAULT_BUTTON_TAG = "button" as const

  type ButtonRenderPropArg = {
    disabled: boolean
    hover: boolean
    focus: boolean
    active: boolean
    autofocus: boolean
  }
  type ButtonPropsWeControl = never

  export type ButtonProps<TTag extends TagType = typeof DEFAULT_BUTTON_TAG> = Props<
    TTag,
    ButtonRenderPropArg,
    ButtonPropsWeControl,
    {
      disabled?: boolean
      autoFocus?: boolean
      type?: "button" | "submit" | "reset"
    }
  >
</script>

<script lang="ts" generics="TTag extends keyof SvelteHTMLElements, TType">
  import { useActivePress } from "../hooks/use-active-press.svelte.js"
  import { useFocusRing } from "../hooks/use-focus-ring.svelte.js"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { stateFromSlot } from "../utils/state.js"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import type { Props, PropsOf, RefType, TagType } from "$lib/utils/types.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const providedDisabled = useDisabled()

  let {
    ref = $bindable(),
    disabled: ownDisabled = false,
    autofocus = false as PropsOf<TTag>["autofocus"],
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
