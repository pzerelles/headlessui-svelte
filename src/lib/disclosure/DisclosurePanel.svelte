<script lang="ts" module>
  import { RenderFeatures, type PropsForFeatures } from "$lib/utils/render.js"
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_PANEL_TAG = "div" as const
  export type PanelRenderPropArg = {
    open: boolean
    close: (focusableElement?: HTMLElement) => void
  }

  let PanelRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

  export type DisclosurePanelOwnProps = {
    element?: HTMLElement
    transition?: boolean
  } & PropsForFeatures<typeof PanelRenderFeatures>

  export type DisclosurePanelProps = Props<typeof DEFAULT_PANEL_TAG, PanelRenderPropArg, DisclosurePanelOwnProps>
</script>

<script lang="ts">
  import { useId } from "$lib/hooks/use-id.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import {
    createDisclosurePanelContext,
    DisclosureStates,
    useDisclosureAPIContext,
    useDisclosureContext,
  } from "./context.svelte.js"
  import { onMount, untrack } from "svelte"
  import { clearOpenClosedContext, State, useOpenClosed } from "$lib/internal/open-closed.js"
  import { transitionDataAttributes, useTransition } from "$lib/hooks/use-transition.svelte.js"

  const internalId = useId()
  let {
    element = $bindable(),
    id = `headlessui-disclosure-panel-${internalId}`,
    transition = false,
    ...theirProps
  }: DisclosurePanelProps = $props()
  const context = useDisclosureContext("DisclosurePanel")
  const { close } = useDisclosureAPIContext("DisclosurePanel")

  onMount(() => {
    context.setPanelElement(element)
  })

  $effect(() => {
    ;[id]
    return untrack(() => {
      context.setPanelId(id ?? undefined)
      return () => {
        context.setPanelId(undefined)
      }
    })
  })

  const usesOpenClosedState = useOpenClosed()
  const _transition = useTransition({
    get enabled() {
      return transition
    },
    get element() {
      return element
    },
    get show() {
      return usesOpenClosedState !== null
        ? (usesOpenClosedState.value & State.Open) === State.Open
        : context.disclosureState === DisclosureStates.Open
    },
    get asChild() {
      return theirProps.asChild
    },
  })

  const slot = $derived({
    open: context.disclosureState === DisclosureStates.Open,
    close,
  } satisfies PanelRenderPropArg)

  const ourProps = $derived({
    id,
    ...transitionDataAttributes(_transition.data),
  })

  createDisclosurePanelContext(() => context.panelId)
  clearOpenClosedContext()
</script>

<ElementOrComponent
  {ourProps}
  {theirProps}
  slots={slot}
  defaultTag={DEFAULT_PANEL_TAG}
  features={PanelRenderFeatures}
  visible={_transition.visible}
  name="DisclosurePanel"
  bind:element
/>
