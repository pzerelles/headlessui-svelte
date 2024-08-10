<script lang="ts" context="module">
  import type { Snippet } from "svelte"
  import type { ElementType, Props } from "$lib/utils/types.js"

  const DEFAULT_SEPARATOR_TAG = "div" as const
  type SeparatorRenderPropArg = {}
  type SeparatorPropsWeControl = "role"

  export type MenuSeparatorProps<TTag extends ElementType = typeof DEFAULT_SEPARATOR_TAG> = Props<
    TTag,
    SeparatorRenderPropArg,
    SeparatorPropsWeControl
  >

  export type MenuSeparatorChildren = Snippet<[SeparatorRenderPropArg]>
</script>

<script lang="ts" generics="TTag extends ElementType">
  let { as = DEFAULT_SEPARATOR_TAG as TTag, children, ...theirProps }: MenuSeparatorProps<TTag> = $props()
  const ourProps = { role: "separator" }
</script>

<svelte:element this={as} {...ourProps} {...theirProps}>
  {#if children}{@render children({})}{/if}
</svelte:element>
