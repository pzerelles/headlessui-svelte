<script lang="ts" module>
  import type { ElementType, Props, PropsOf } from "$lib/utils/types.js"

  let DEFAULT_DESCRIPTION_TAG = "p" as const

  export type DescriptionProps<TTag extends ElementType = typeof DEFAULT_DESCRIPTION_TAG> = Props<TTag>
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_DESCRIPTION_TAG">
  import { htmlid } from "../utils/id.js"
  import { stateFromSlot } from "../utils/state.js"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { onMount } from "svelte"
  import { useDescriptionContext } from "./context.svelte.js"

  const internalId = htmlid()
  const providedDisabled = useDisabled()

  let {
    as,
    id = `headlessui-description-${internalId}` as PropsOf<TTag>["id"],
    children,
    ...theirProps
  }: { as?: TTag } & DescriptionProps<TTag> = $props()

  const context = useDescriptionContext()

  onMount(() => {
    context.register(id)
  })

  const disabled = $derived(providedDisabled.value || false)
  const slot = $derived({ disabled })
  const ourProps = $derived({ id, ...stateFromSlot(slot) })
</script>

<svelte:element this={as ?? DEFAULT_DESCRIPTION_TAG} {...ourProps} {...theirProps}>
  {#if children}{@render children(slot, {})}{/if}
</svelte:element>
