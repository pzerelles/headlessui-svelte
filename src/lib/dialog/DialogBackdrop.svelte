<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  let DEFAULT_BACKDROP_TAG = "div" as const
  export type BackdropRenderPropArg = {
    open: boolean
  }

  export type DialogBackdropOwnProps = { transition?: boolean; element?: HTMLElement }

  export type DialogBackdropProps = Props<typeof DEFAULT_BACKDROP_TAG, BackdropRenderPropArg, DialogBackdropOwnProps>
</script>

<script lang="ts">
  import { DialogStates, useDialogContext } from "./context.svelte.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { mergeProps } from "$lib/utils/render.js"
  import TransitionChild from "$lib/transition/TransitionChild.svelte"

  let { element = $bindable(), transition = false, ...theirProps }: DialogBackdropProps = $props()
  const _state = useDialogContext("Dialog.Panel")
  const { dialogState, unmount } = $derived(_state)

  const slot = $derived({ open: dialogState === DialogStates.Open } satisfies BackdropRenderPropArg)

  const ourProps = mergeProps({
    "aria-hidden": true,
  })
</script>

{#if transition}
  <TransitionChild asChild {unmount} {element}>
    {#snippet children({ props, ...slot })}
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
