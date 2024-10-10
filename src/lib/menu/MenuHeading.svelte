<script lang="ts" module>
  import { onMount } from "svelte"
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_HEADING_TAG = "header" as const

  type HeadingPropsWeControl = "role"

  export type MenuHeadingOwnProps = {
    element?: HTMLElement
    id?: string
  }

  export type MenuHeadingProps = Props<typeof DEFAULT_HEADING_TAG, {}, MenuHeadingOwnProps>
</script>

<script lang="ts">
  import { useId } from "$lib/hooks/use-id.js"
  import { useLabelContext } from "$lib/label/context.svelte.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const internalId = useId()
  let {
    element = $bindable(),
    id = `headlessui-menu-heading-${internalId}`,
    ...theirProps
  }: MenuHeadingProps = $props()

  const context = useLabelContext()
  onMount(() => context.register(id))

  const ourProps = $derived({ id, role: "presentation", ...context.props })
</script>

<ElementOrComponent {ourProps} {theirProps} defaultTag={DEFAULT_HEADING_TAG} name="MenuItem" bind:element />
