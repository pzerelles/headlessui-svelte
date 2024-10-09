<script lang="ts" module>
  import type { ElementType, Props } from "$lib/utils/types.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  let DEFAULT_PANEL_TAG = "div" as const
  type PanelRenderPropArg = {
    open: boolean
  }

  export type DialogPanelProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_PANEL_TAG],
    PanelRenderPropArg,
    never,
    {
      transition?: boolean
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
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
  }: DialogPanelProps<TTag> = $props()
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
  <TransitionChild {unmount} {element}>
    {#snippet children({ slot, props })}
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
