<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_LIST_TAG = "div" as const
  export type ListRenderPropArg = {
    selectedIndex: number
  }
  type ListPropsWeControl = "aria-orientation" | "role"

  export type TabListOwnProps = {
    element?: HTMLElement
  }

  export type TabListProps = Props<typeof DEFAULT_LIST_TAG, ListRenderPropArg, TabListOwnProps>
</script>

<script lang="ts">
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { useTabs } from "./context.svelte.js"

  const context = useTabs("TabList")
  const { orientation, selectedIndex } = $derived(context)

  const slot = $derived({ selectedIndex } satisfies ListRenderPropArg)

  let { element = $bindable(), ...theirProps }: TabListProps = $props()
  const ourProps = $derived({
    role: "tablist",
    "aria-orientation": orientation,
  })
</script>

<ElementOrComponent {ourProps} {theirProps} slots={slot} defaultTag={DEFAULT_LIST_TAG} name="TabList" bind:element />
