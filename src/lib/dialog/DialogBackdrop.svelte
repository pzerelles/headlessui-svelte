<script lang="ts" module>
  import type { ElementType, Props } from "../utils/types.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  let DEFAULT_BACKDROP_TAG = "div" as const
  type BackdropRenderPropArg = {
    open: boolean
  }

  export type DialogBackdropProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_BACKDROP_TAG],
    BackdropRenderPropArg,
    never,
    { transition?: boolean }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import { DialogStates, useDialogContext } from "./context.svelte.js"
  import ElementOrComponent from "../utils/ElementOrComponent.svelte"
  import { mergeProps } from "../utils/render.js"
  import TransitionChild from "../transition/TransitionChild.svelte"

  let { element = $bindable(), transition = false, ...theirProps }: DialogBackdropProps<TTag> = $props()
  const _state = useDialogContext("Dialog.Panel")
  const { dialogState, unmount } = $derived(_state)

  const slot = $derived({ open: dialogState === DialogStates.Open } satisfies BackdropRenderPropArg)

  const ourProps = mergeProps({
    "aria-hidden": true,
  })
</script>

{#if transition}
  <TransitionChild {unmount} {element}>
    {#snippet children({ slot, props })}
      <ElementOrComponent
        ourProps={{ ...ourProps, ...props }}
        {theirProps}
        slots={slot}
        defaultTag={DEFAULT_BACKDROP_TAG}
        name="DialogBackdrop"
        bind:element
      />
    {/snippet}
  </TransitionChild>
{:else}
  <ElementOrComponent
    {ourProps}
    {theirProps}
    slots={slot}
    defaultTag={DEFAULT_BACKDROP_TAG}
    name="DialogBackdrop"
    bind:element
  />
{/if}
