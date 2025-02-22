<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_BUTTON_TAG = "button" as const

  export type ButtonRenderPropArg = {
    disabled: boolean
    hover: boolean
    focus: boolean
    active: boolean
    autofocus: boolean
  }

  export type ButtonOwnProps = {
    element?: HTMLElement
    disabled?: boolean
    autofocus?: boolean
    type?: "button" | "submit" | "reset"
  }

  export type ButtonProps = Props<typeof DEFAULT_BUTTON_TAG, ButtonRenderPropArg, ButtonOwnProps>
</script>

<script lang="ts">
  import { useActivePress } from "../hooks/use-active-press.svelte.js"
  import { useFocusRing } from "../hooks/use-focus-ring.svelte.js"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const providedDisabled = useDisabled()

  let {
    element = $bindable(),
    disabled: ownDisabled = false,
    autofocus = false,
    type = "button",
    ...theirProps
  }: ButtonProps = $props()

  const disabled = $derived(providedDisabled.current || ownDisabled)

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

  const slots = $derived({
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
      pressProps
    )
  )
</script>

<ElementOrComponent {ourProps} {theirProps} {slots} defaultTag={DEFAULT_BUTTON_TAG} name="Button" bind:element />
