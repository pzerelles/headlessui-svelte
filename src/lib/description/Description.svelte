<script lang="ts" module>
  import type { ElementType, Props, PropsOf } from "$lib/utils/types.js"

  let DEFAULT_DESCRIPTION_TAG = "p" as const

  export type DescriptionProps<TTag extends ElementType = typeof DEFAULT_DESCRIPTION_TAG> = Props<TTag>
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_DESCRIPTION_TAG">
  import { useId } from "$lib/hooks/use-id.js"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useDescriptionContext } from "./context.svelte.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { untrack } from "svelte"

  const internalId = useId()
  const providedDisabled = useDisabled()

  let {
    ref = $bindable(),
    id = `headlessui-description-${internalId}` as PropsOf<TTag>["id"],
    ...theirProps
  }: { as?: TTag } & DescriptionProps<TTag> = $props()

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
  bind:ref
/>
