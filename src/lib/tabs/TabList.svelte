<script lang="ts" context="module">
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

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_LIST_TAG">
  import { useData } from "./TabGroup.svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const data = useData("Tab.List")
  const { orientation, selectedIndex } = $derived(data)

  const slot = $derived({ selectedIndex } satisfies ListRenderPropArg)

  let { ref = $bindable(), ...theirProps }: { as?: TTag } & TabListProps<TTag> = $props()
  const ourProps = $derived({
    role: "tablist",
    "aria-orientation": orientation,
  })
</script>

<ElementOrComponent {ourProps} {theirProps} {slot} defaultTag={DEFAULT_LIST_TAG} name="TabList" bind:ref />
