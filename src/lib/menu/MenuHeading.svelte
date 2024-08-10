<script lang="ts" context="module">
  import { onMount, type Snippet } from "svelte"
  import type { ElementType, Props } from "$lib/utils/types.js"

  const DEFAULT_HEADING_TAG = "header" as const
  type HeadingRenderPropArg = {}
  type HeadingPropsWeControl = "role"

  export type MenuHeadingProps<TTag extends ElementType = typeof DEFAULT_HEADING_TAG> = Props<
    TTag,
    HeadingRenderPropArg,
    HeadingPropsWeControl
  >

  export type MenuHeadingChildren = Snippet<[HeadingRenderPropArg]>
</script>

<script lang="ts" generics="TTag extends ElementType">
  import { useId } from "$lib/hooks/use-id.js"
  import { useLabelContext } from "$lib/label/Label.svelte"
  import type { SvelteHTMLElements } from "svelte/elements"

  const internalId = useId()
  let {
    as = DEFAULT_HEADING_TAG as TTag,
    id = `headlessui-menu-heading-${internalId}` as SvelteHTMLElements[TTag][string],
    children,
    ...theirProps
  }: MenuHeadingProps<TTag> = $props()

  const context = useLabelContext()
  onMount(() => context.register(id))

  const ourProps = $derived({ id, role: "presentation", ...context.props })
</script>

<svelte:element this={as} {...ourProps} {...theirProps}>
  {#if children}{@render children({})}{/if}
</svelte:element>
