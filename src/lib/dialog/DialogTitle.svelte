<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  let DEFAULT_TITLE_TAG = "h2" as const
  export type TitleRenderPropArg = {
    open: boolean
  }

  export type DialogTitleOwnProps = { id?: string; element?: HTMLElement }

  export type DialogTitleProps = Props<typeof DEFAULT_TITLE_TAG, TitleRenderPropArg, DialogTitleOwnProps>

  //
</script>

<script lang="ts">
  import { useId } from "$lib/hooks/use-id.js"
  import { DialogStates, useDialogContext } from "./context.svelte.js"
  import { onMount } from "svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { mergeProps } from "$lib/utils/render.js"

  const internalId = useId()
  let {
    element = $bindable(),
    id = `headlessui-dialog-title-${internalId}`,
    ...theirProps
  }: DialogTitleProps = $props()
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

<ElementOrComponent
  {ourProps}
  {theirProps}
  slots={slot}
  defaultTag={DEFAULT_TITLE_TAG}
  name="DialogTitle"
  bind:element
/>
