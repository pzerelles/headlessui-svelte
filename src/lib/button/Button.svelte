<script lang="ts" module>
  import type { ElementType, Props } from "$lib/utils/types.js"
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

  export type ButtonProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_BUTTON_TAG],
    ButtonRenderPropArg,
    ButtonPropsWeControl,
    {
      disabled?: boolean
      autofocus?: boolean
      type?: "button" | "submit" | "reset"
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import { useActivePress } from "../hooks/use-active-press.svelte.js"
  import { useFocusRing } from "../hooks/use-focus-ring.svelte.js"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const providedDisabled = useDisabled()

  let {
    disabled: ownDisabled = false,
    autofocus = false,
    type = "button",
    element = $bindable(),
    ...theirProps
  }: ButtonProps<TTag> = $props()

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
      pressProps
    )
  )
</script>

<ElementOrComponent {ourProps} {theirProps} {slot} defaultTag={DEFAULT_BUTTON_TAG} name="Button" bind:element />
