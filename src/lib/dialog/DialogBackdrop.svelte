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
  import { DialogStates, useDialogContext } from "./Dialog.svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  let { ref = $bindable(), transition = false, ...theirProps }: { as?: TTag } & DialogBackdropProps<TTag> = $props()
  const _state = useDialogContext("Dialog.Panel")
  const { dialogState, unmount } = $derived(_state)

  const slot = $derived({ open: dialogState === DialogStates.Open } satisfies BackdropRenderPropArg)

  const ourProps = {
    "aria-hidden": true,
  }

  /*
  let Wrapper = transition ? TransitionChild : Fragment
  let wrapperProps = transition ? { unmount } : {}

  return (
    <Wrapper {...wrapperProps}>
      {render({
        ourProps,
        theirProps,
        slot,
        defaultTag: DEFAULT_BACKDROP_TAG,
        name: 'Dialog.Backdrop',
      })}
    </Wrapper>
  )
  */
</script>

<ElementOrComponent
  {ourProps}
  {theirProps}
  slots={slot}
  defaultTag={DEFAULT_BACKDROP_TAG}
  name="DialogBackdrop"
  bind:ref
/>
