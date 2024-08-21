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

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_PANEL_TAG">
  import { useId } from "$lib/hooks/use-id.js"
  import { mergeProps, RenderFeatures, type PropsForFeatures } from "$lib/utils/render.js"
  import { useActions, useData } from "./TabGroup.svelte"
  import { useStableCollectionIndex } from "$lib/utils/StableCollection.svelte"
  import { useFocusRing } from "$lib/hooks/use-focus-ring.svelte.js"
  import Hidden from "$lib/internal/Hidden.svelte"
  import type { MutableRefObject } from "$lib/utils/ref.svelte.js"
  import { onMount } from "svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const internalId = useId()
  let {
    ref = $bindable(),
    id = `headlessui-tabs-panel-${internalId}`,
    tabIndex = 0,
    ...theirProps
  }: { as?: TTag } & TabPanelProps<TTag> = $props()
  const data = useData("Tab.Panel")
  const { selectedIndex, tabs, panels } = $derived(data)
  const actions = useActions("Tab.Panel")

  const panelRef = $derived<MutableRefObject<HTMLElement | undefined>>({ current: ref })

  onMount(() => actions.registerPanel(panelRef))

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
  <Hidden aria-hidden="true" {...ourProps} bind:ref />
{:else}
  <ElementOrComponent
    {ourProps}
    {theirProps}
    {slot}
    defaultTag={DEFAULT_PANEL_TAG}
    features={PanelRenderFeatures}
    name="TabPanel"
    bind:ref
  />
{/if}
