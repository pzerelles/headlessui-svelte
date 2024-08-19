<script lang="ts" context="module">
  import type { ElementType, Props, PropsOf } from "$lib/utils/types.js"

  let DEFAULT_TITLE_TAG = "h2" as const
  type TitleRenderPropArg = {
    open: boolean
  }

  export type DialogTitleProps<TTag extends ElementType = typeof DEFAULT_TITLE_TAG> = Props<TTag, TitleRenderPropArg>

  //
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_TITLE_TAG">
  import { useId } from "$lib/hooks/use-id.js"
  import { DialogStates, useDialogContext } from "./Dialog.svelte"
  import { onMount } from "svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { mergeProps } from "$lib/utils/render.js"

  const internalId = useId()
  let {
    ref = $bindable(),
    id = `headlessui-dialog-title-${internalId}` as PropsOf<TTag>[string],
    ...theirProps
  }: { as?: TTag } & DialogTitleProps<TTag> = $props()
  const _state = useDialogContext("Dialog.Panel")
  const { dialogState, setTitleId } = $derived(_state)

  onMount(() => {
    setTitleId(id)
    return () => setTitleId(null)
  })

  const slot = $derived({ open: dialogState === DialogStates.Open } satisfies TitleRenderPropArg)

  const ourProps = $derived(
    mergeProps({
      id,
    })
  )
</script>

<ElementOrComponent {ourProps} {theirProps} slots={slot} defaultTag={DEFAULT_TITLE_TAG} name="DialogTitle" bind:ref />
