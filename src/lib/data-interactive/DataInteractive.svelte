<script lang="ts" module>
  import type { PropsAsChild } from "$lib/utils/types.js"
  import { useFocusRing } from "$lib/hooks/use-focus-ring.svelte.js"
  import { useActivePress } from "$lib/hooks/use-active-press.svelte.js"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const DEFAULT_DATA_INTERACTIVE_TAG = "svelte:fragment" as const

  export type DataInteractiveRenderPropArg = {
    hover: boolean
    focus: boolean
    active: boolean
  }

  export type DataInteractiveProps = PropsAsChild<DataInteractiveRenderPropArg>
</script>

<script lang="ts">
  let { ...theirProps }: DataInteractiveProps = $props()

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

<ElementOrComponent {ourProps} {theirProps} slots={slot} name="DataInteractive" />
