<script lang="ts" module>
  import ElementOrComponent from "../utils/ElementOrComponent.svelte"
  import type { ElementType, Props } from "../utils/types.js"
  import { useTabs } from "./context.svelte.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  let DEFAULT_PANELS_TAG = "div" as const
  type PanelsRenderPropArg = {
    selectedIndex: number
  }

  export type TabPanelsProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_PANELS_TAG],
    PanelsRenderPropArg
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  const context = useTabs("TabPanels")
  const { selectedIndex } = $derived(context)

  const slot = $derived({ selectedIndex } satisfies PanelsRenderPropArg)

  let { element = $bindable(), ...theirProps }: TabPanelsProps<TTag> = $props()
</script>

<ElementOrComponent {theirProps} {slot} defaultTag={DEFAULT_PANELS_TAG} name="TabPanel" bind:element />
