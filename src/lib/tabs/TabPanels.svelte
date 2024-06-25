<script lang="ts" context="module">
  import type { ElementType, Props } from "$lib/utils/types.js"
  import { useData } from "./TabGroup.svelte"

  let DEFAULT_PANELS_TAG = "div" as const
  type PanelsRenderPropArg = {
    selectedIndex: number
  }

  export type TabPanelsProps<TTag extends ElementType = typeof DEFAULT_PANELS_TAG> = Props<TTag, PanelsRenderPropArg>
</script>

<script lang="ts" generics="TTag extends ElementType">
  const data = useData("Tab.Panels")
  const { selectedIndex } = $derived(data)

  const slot = $derived({ selectedIndex } satisfies PanelsRenderPropArg)

  const { as, children, ...theirProps }: TabPanelsProps<TTag> = $props()
</script>

<svelte:element this={as ?? DEFAULT_PANELS_TAG} {...theirProps}>
  {#if children}{@render children(slot)}{/if}
</svelte:element>
