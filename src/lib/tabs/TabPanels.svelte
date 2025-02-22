<script lang="ts" module>
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import type { Props } from "$lib/utils/types.js"
  import { useTabs } from "./context.svelte.js"

  let DEFAULT_PANELS_TAG = "div" as const
  export type PanelsRenderPropArg = {
    selectedIndex: number
  }

  export type TabPanelsOwnProps = { element?: HTMLElement }

  export type TabPanelsProps = Props<typeof DEFAULT_PANELS_TAG, PanelsRenderPropArg, TabPanelsOwnProps>
</script>

<script lang="ts">
  const context = useTabs("TabPanels")
  const { selectedIndex } = $derived(context)

  const slot = $derived({ selectedIndex } satisfies PanelsRenderPropArg)

  let { element = $bindable(), ...theirProps }: TabPanelsProps = $props()
</script>

<ElementOrComponent {theirProps} slots={slot} defaultTag={DEFAULT_PANELS_TAG} name="TabPanel" bind:element />
