<script lang="ts" context="module">
  import type { ElementType, Props } from "$lib/utils/types.js"

  let DEFAULT_PANEL_TAG = "div" as const
  type PanelRenderPropArg = {
    open: boolean
  }

  export type DialogPanelProps<TTag extends ElementType = typeof DEFAULT_PANEL_TAG> = Props<
    TTag,
    PanelRenderPropArg,
    never,
    { transition?: boolean }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_PANEL_TAG">
  import { useId } from "$lib/hooks/use-id.js"
  import { DialogStates, useDialogContext } from "./Dialog.svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  let internalId = useId()
  let {
    ref = $bindable(),
    id = `headlessui-dialog-panel-${internalId}`,
    transition = false,
    ...theirProps
  }: { as?: TTag } & DialogPanelProps<TTag> = $props()
  const _state = useDialogContext("Dialog.Panel")
  const { dialogState, unmount } = $derived(_state)

  const slot = $derived({ open: dialogState === DialogStates.Open } satisfies PanelRenderPropArg)

  // Prevent the click events inside the Dialog.Panel from bubbling through the React Tree which
  // could submit wrapping <form> elements even if we portalled the Dialog.
  const handleClick = (event: MouseEvent) => {
    event.stopPropagation()
  }

  const ourProps = $derived({
    id,
    onclick: handleClick,
  })

  /*
  let Wrapper = transition ? TransitionChild : Fragment
  let wrapperProps = transition ? { unmount } : {}

  return (
    <Wrapper {...wrapperProps}>
      {render({
        ourProps,
        theirProps,
        slot,
        defaultTag: DEFAULT_PANEL_TAG,
        name: 'Dialog.Panel',
      })}
    </Wrapper>
  )
  */
</script>

<ElementOrComponent {ourProps} {theirProps} slots={slot} defaultTag={DEFAULT_PANEL_TAG} name="DialogPanel" bind:ref />
