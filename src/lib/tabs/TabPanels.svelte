<script lang="ts" module>
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import type { ElementType, Props } from "$lib/utils/types.js"
  import { useTabs } from "./context.svelte.js"

  let DEFAULT_PANELS_TAG = "div" as const
  type PanelsRenderPropArg = {
    selectedIndex: number
  }

  export type TabPanelsProps<TTag extends ElementType = typeof DEFAULT_PANELS_TAG> = Props<TTag, PanelsRenderPropArg>
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_PANELS_TAG">
  const context = useTabs("TabPanels")
  const { selectedIndex } = $derived(context)

  const slot = $derived({ selectedIndex } satisfies PanelsRenderPropArg)

  let { ref = $bindable(), ...theirProps }: { as?: TTag } & TabPanelsProps<TTag> = $props()
</script>

<ElementOrComponent {theirProps} {slot} defaultTag={DEFAULT_PANELS_TAG} name="TabPanel" bind:ref />
