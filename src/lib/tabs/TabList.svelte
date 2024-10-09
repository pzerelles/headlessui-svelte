<script lang="ts" module>
  import type { ElementType, Props } from "../utils/types.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  const DEFAULT_LIST_TAG = "div" as const
  type ListRenderPropArg = {
    selectedIndex: number
  }
  type ListPropsWeControl = "aria-orientation" | "role"

  export type TabListProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_LIST_TAG],
    ListRenderPropArg,
    ListPropsWeControl
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import ElementOrComponent from "../utils/ElementOrComponent.svelte"
  import { useTabs } from "./context.svelte.js"

  const context = useTabs("TabList")
  const { orientation, selectedIndex } = $derived(context)

  const slot = $derived({ selectedIndex } satisfies ListRenderPropArg)

  let { element = $bindable(), ...theirProps }: TabListProps<TTag> = $props()
  const ourProps = $derived({
    role: "tablist",
    "aria-orientation": orientation,
  })
</script>

<ElementOrComponent {ourProps} {theirProps} {slot} defaultTag={DEFAULT_LIST_TAG} name="TabList" bind:element />
