<script lang="ts" context="module">
  import type { ElementType, Props } from "$lib/utils/types.js"

  let DEFAULT_BACKDROP_TAG = "div" as const
  type BackdropRenderPropArg = {
    open: boolean
  }

  export type DialogBackdropProps<TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG> = Props<
    TTag,
    BackdropRenderPropArg,
    never,
    { transition?: boolean }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG">
  import { DialogStates, useDialogContext } from "./context.svelte.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { mergeProps } from "$lib/utils/render.js"
  import TransitionChild from "$lib/transition/TransitionChild.svelte"

  let { ref = $bindable(), transition = false, ...theirProps }: { as?: TTag } & DialogBackdropProps<TTag> = $props()
  const _state = useDialogContext("Dialog.Panel")
  const { dialogState, unmount } = $derived(_state)

  const slot = $derived({ open: dialogState === DialogStates.Open } satisfies BackdropRenderPropArg)

  const ourProps = mergeProps({
    "aria-hidden": true,
  })
</script>

{#if transition}
  <TransitionChild {unmount} {ref}>
    {#snippet children(slot, props)}
      <ElementOrComponent
        ourProps={{ ...ourProps, ...props }}
        {theirProps}
        slots={slot}
        defaultTag={DEFAULT_BACKDROP_TAG}
        name="DialogBackdrop"
        bind:ref
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
    bind:ref
  />
{/if}
