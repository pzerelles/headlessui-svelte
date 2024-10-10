<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_DESCRIPTION_TAG = "p" as const

  export type DescriptionOwnProps = {
    id?: string
    element?: HTMLElement
  }

  export type DescriptionProps = Props<typeof DEFAULT_DESCRIPTION_TAG, {}, DescriptionOwnProps>
</script>

<script lang="ts">
  import { useId } from "$lib/hooks/use-id.js"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useDescriptionContext } from "./context.svelte.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { untrack } from "svelte"

  const internalId = useId()
  const providedDisabled = useDisabled()

  let { element = $bindable(), id = `headlessui-description-${internalId}`, ...theirProps }: DescriptionProps = $props()

  const { register } = useDescriptionContext()
  $effect(() => {
    id
    return untrack(() => register(id))
  })

  const disabled = $derived(providedDisabled.current || false)
  const slot = $derived({ disabled })
  const ourProps = $derived({ id })
</script>

<ElementOrComponent
  {ourProps}
  {theirProps}
  slots={slot}
  defaultTag={DEFAULT_DESCRIPTION_TAG}
  name="Description"
  bind:element
/>
