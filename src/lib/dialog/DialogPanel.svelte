<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  let DEFAULT_PANEL_TAG = "div" as const
  export type PanelRenderPropArg = {
    open: boolean
  }

  export type DialogPanelOwnProps = {
    element?: HTMLElement
    id?: string
    transition?: boolean
  }

  export type DialogPanelProps = Props<typeof DEFAULT_PANEL_TAG, PanelRenderPropArg, DialogPanelOwnProps>
</script>

<script lang="ts">
  import { useId } from "$lib/hooks/use-id.js"
  import { DialogStates, useDialogContext } from "./context.svelte.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { mergeProps } from "$lib/utils/render.js"
  import TransitionChild from "$lib/transition/TransitionChild.svelte"

  let internalId = useId()
  let {
    element = $bindable(),
    id = `headlessui-dialog-panel-${internalId}`,
    transition = false,
    ...theirProps
  }: DialogPanelProps = $props()
  const _state = useDialogContext("Dialog.Panel")
  const { dialogState, unmount } = $derived(_state)

  const slot = $derived({ open: dialogState === DialogStates.Open } satisfies PanelRenderPropArg)

  // Prevent the click events inside the Dialog.Panel from bubbling through the React Tree which
  // could submit wrapping <form> elements even if we portalled the Dialog.
  const handleClick = (event: MouseEvent) => {
    event.stopPropagation()
  }

  const ourProps = $derived(
    mergeProps({
      id,
      onclick: handleClick,
    })
  )
</script>

{#if transition}
  <TransitionChild asChild {unmount} {element}>
    {#snippet children({ props, ...slot })}
      <ElementOrComponent
        ourProps={{ ...ourProps, ...props }}
        {theirProps}
        slots={slot}
        defaultTag={DEFAULT_PANEL_TAG}
        name="DialogPanel"
        bind:element
      />
    {/snippet}
  </TransitionChild>
{:else}
  <ElementOrComponent
    {ourProps}
    {theirProps}
    slots={slot}
    defaultTag={DEFAULT_PANEL_TAG}
    name="DialogPanel"
    bind:element
  />
{/if}
