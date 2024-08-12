<script lang="ts" context="module">
  import type { ElementType, HTMLElementType, Props } from "$lib/utils/types.js"
  import { useFocusRing } from "$lib/hooks/use-focus-ring.svelte.js"
  import { useActivePress } from "$lib/hooks/use-active-press.svelte.js"
  import { stateFromSlot } from "$lib/utils/state.js"
  import type { Snippet } from "svelte"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const DEFAULT_DATA_INTERACTIVE_TAG = "svelte:fragment" as const

  type DataInteractiveRenderPropArg = {
    hover: boolean
    focus: boolean
    active: boolean
  }
  type DataInteractivePropsWeControl = never

  export type DataInteractiveProps<TTag extends ElementType = typeof DEFAULT_DATA_INTERACTIVE_TAG> = Props<
    TTag,
    DataInteractiveRenderPropArg,
    DataInteractivePropsWeControl,
    {
      ref?: HTMLElementType<TTag> | null
    }
  >

  export type DataInteractiveChildren = Snippet<[DataInteractiveRenderPropArg]>
</script>

<script lang="ts" generics="TTag extends ElementType">
  let {
    as = DEFAULT_DATA_INTERACTIVE_TAG as TTag,
    ref = $bindable(),
    children,
    ...theirProps
  }: DataInteractiveProps<TTag> = $props()

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

  const ourProps = $derived(mergeProps(focusProps, hoverProps, pressProps, stateFromSlot(slot)))
</script>

<ElementOrComponent {as} bind:ref {...ourProps} {...theirProps} {slot} {children} />
