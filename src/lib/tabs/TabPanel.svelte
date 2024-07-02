<script lang="ts" context="module">
  import type { ElementType, Props } from "$lib/utils/types.js"

  const DEFAULT_PANEL_TAG = "div" as const
  type PanelRenderPropArg = {
    selected: boolean
    focus: boolean
  }
  type PanelPropsWeControl = "role" | "aria-labelledby"
  const PanelRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

  export type TabPanelProps<TTag extends ElementType = typeof DEFAULT_PANEL_TAG> = Props<
    TTag,
    PanelRenderPropArg,
    PanelPropsWeControl,
    PropsForFeatures<typeof PanelRenderFeatures> & { id?: string; tabIndex?: number }
  >
</script>

<script lang="ts" generics="TTag extends ElementType">
  import { useId } from "$lib/hooks/use-id.js"
  import { RenderFeatures, type PropsForFeatures } from "$lib/utils/render.js"
  import { useActions, useData } from "./TabGroup.svelte"
  import { useStableCollectionIndex } from "$lib/utils/StableCollection.svelte"
  import { createFocusRing } from "$lib/actions/focusRing.svelte.js"
  import Hidden from "$lib/internal/Hidden.svelte"
  import { stateFromSlot } from "$lib/utils/state.js"
  import type { MutableRefObject } from "$lib/utils/ref.svelte.js"
  import { onMount } from "svelte"

  const internalId = useId()
  const {
    as,
    id = `headlessui-tabs-panel-${internalId}`,
    tabIndex = 0,
    children,
    static: isStatic = false,
    unmount = true,
    ...theirProps
  }: TabPanelProps<TTag> = $props()
  const data = useData("Tab.Panel")
  const { selectedIndex, tabs, panels } = $derived(data)
  const actions = useActions("Tab.Panel")

  let internalPanelRef = $state<HTMLElement>()
  const panelRef = $derived<MutableRefObject<HTMLElement | undefined>>({ current: internalPanelRef })

  onMount(() => actions.registerPanel(panelRef))

  const mySSRIndex = useStableCollectionIndex("panels")

  const myIndex = $derived.by(() => {
    const index = tabs.findIndex((panel) => $state.is(panel, panelRef))
    return index === -1 ? mySSRIndex : index
  })

  const selected = $derived(myIndex === selectedIndex)

  const fr = createFocusRing()
  const slot = $derived({
    selected,
    focus: fr.focusVisible,
  } satisfies PanelRenderPropArg)

  const ourProps = $derived({
    id,
    role: "tabpanel",
    "aria-labelledby": tabs[myIndex]?.current?.id,
    tabIndex: selected ? 0 : -1,
    ...stateFromSlot(slot),
  })
</script>

{#if !selected && unmount && !isStatic}
  <Hidden as="span" bind:ref={internalPanelRef} aria-hidden="true" {...ourProps} />
{:else}
  <svelte:element
    this={as ?? DEFAULT_PANEL_TAG}
    bind:this={internalPanelRef}
    use:fr.focusRingAction
    {...ourProps}
    {...theirProps}
    hidden={isStatic || selected ? undefined : true}
    style={isStatic || selected ? theirProps.style : "display: none;"}
  >
    {#if children}{@render children(slot)}{/if}
  </svelte:element>
{/if}
