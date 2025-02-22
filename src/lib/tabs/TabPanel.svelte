<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_PANEL_TAG = "div" as const
  export type PanelRenderPropArg = {
    selected: boolean
    focus: boolean
  }
  type PanelPropsWeControl = "role" | "aria-labelledby"
  const PanelRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

  export type TabPanelOwnProps = PropsForFeatures<typeof PanelRenderFeatures> & {
    element?: HTMLElement
    id?: string
    tabIndex?: number
  }

  export type TabPanelProps = Props<typeof DEFAULT_PANEL_TAG, PanelRenderPropArg, TabPanelOwnProps>
</script>

<script lang="ts">
  import { useId } from "$lib/hooks/use-id.js"
  import { mergeProps, RenderFeatures, type PropsForFeatures } from "$lib/utils/render.js"
  import { useStableCollectionIndex } from "$lib/utils/StableCollection.svelte"
  import { useFocusRing } from "$lib/hooks/use-focus-ring.svelte.js"
  import Hidden from "$lib/internal/Hidden.svelte"
  import type { MutableRefObject } from "$lib/utils/ref.svelte.js"
  import { onMount } from "svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { useTabs } from "./context.svelte.js"

  const internalId = useId()
  let {
    element = $bindable(),
    id = `headlessui-tabs-panel-${internalId}`,
    tabIndex = 0,
    ...theirProps
  }: TabPanelProps = $props()
  const context = useTabs("TabPanel")
  const { selectedIndex, tabs, panels, registerPanel } = $derived(context)

  const panelRef = $derived<MutableRefObject<HTMLElement | undefined>>({ current: element })

  onMount(() => registerPanel(panelRef))

  const mySSRIndex = useStableCollectionIndex("panels")

  const myIndex = $derived.by(() => {
    const index = tabs.findIndex((panel) => panel === panelRef)
    return index === -1 ? mySSRIndex : index
  })

  const selected = $derived(myIndex === selectedIndex)

  const { isFocusVisible: focus, focusProps } = $derived(useFocusRing())
  const slot = $derived({
    selected,
    focus,
  } satisfies PanelRenderPropArg)

  const ourProps = $derived(
    mergeProps(
      {
        id,
        role: "tabpanel",
        "aria-labelledby": tabs[myIndex]?.current?.id,
        tabIndex: selected ? 0 : -1,
      },
      focusProps
    )
  )
</script>

{#if !selected && (theirProps.unmount ?? true) && !(theirProps.static ?? false)}
  <Hidden aria-hidden="true" {...ourProps} bind:element />
{:else}
  <ElementOrComponent
    {ourProps}
    {theirProps}
    slots={slot}
    defaultTag={DEFAULT_PANEL_TAG}
    features={PanelRenderFeatures}
    name="TabPanel"
    bind:element
  />
{/if}
