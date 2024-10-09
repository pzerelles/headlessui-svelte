<script lang="ts" module>
  import type { Props, ElementType } from "../utils/types.js"
  import { useFocusRing } from "../hooks/use-focus-ring.svelte.js"
  import { useActivePress } from "../hooks/use-active-press.svelte.js"
  import { useHover } from "../hooks/use-hover.svelte.js"
  import { mergeProps } from "../utils/render.js"
  import ElementOrComponent from "../utils/ElementOrComponent.svelte"

  const DEFAULT_DATA_INTERACTIVE_TAG = "svelte:fragment" as const

  type DataInteractiveRenderPropArg = {
    hover: boolean
    focus: boolean
    active: boolean
  }

  export type DataInteractiveProps<TTag extends ElementType = undefined> = Props<TTag, {}, DataInteractiveRenderPropArg>
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  let { element = $bindable(), ...theirProps }: DataInteractiveProps<TTag> = $props()

  // Ideally we can use a `disabled` prop, but that would depend on the props of the child element
  // and we don't have access to that in this component.

  const disabled = false

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

  const ourProps = $derived(mergeProps(focusProps, hoverProps, pressProps))
</script>

<ElementOrComponent
  {ourProps}
  {theirProps}
  {slot}
  defaultTag={DEFAULT_DATA_INTERACTIVE_TAG}
  name="DataInteractive"
  bind:element
/>
