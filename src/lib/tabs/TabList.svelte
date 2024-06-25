<script lang="ts" context="module">
  import { stateFromSlot } from "$lib/utils/state.js"
  import type { ElementType, Props } from "$lib/utils/types.js"

  const DEFAULT_LIST_TAG = "div" as const
  type ListRenderPropArg = {
    selectedIndex: number
  }
  type ListPropsWeControl = "aria-orientation" | "role"

  export type TabListProps<TTag extends ElementType = typeof DEFAULT_LIST_TAG> = Props<
    TTag,
    ListRenderPropArg,
    ListPropsWeControl,
    {
      //
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType">
  import { useData } from "./TabGroup.svelte"

  const data = useData("Tab.List")
  const { orientation, selectedIndex } = $derived(data)

  const slot = $derived({ selectedIndex } satisfies ListRenderPropArg)

  const { as, children, ...theirProps }: TabListProps<TTag> = $props()
  const ourProps = $derived({
    role: "tablist",
    "aria-orientation": orientation,
  })
</script>

<svelte:element this={as ?? DEFAULT_LIST_TAG} {...ourProps} {...theirProps}>
  {#if children}{@render children(slot)}{/if}
</svelte:element>
