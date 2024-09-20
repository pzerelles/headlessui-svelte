<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  type DescriptionSlot = {
    disabled: boolean
  }

  export type DescriptionProps = Props<"p", DescriptionSlot, never, { asChild?: boolean }>
</script>

<script lang="ts">
  import { useId } from "$lib/hooks/use-id.js"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useDescriptionContext } from "./context.svelte.js"
  import { untrack } from "svelte"
  import { renderProps } from "$lib/utils/render.js"

  const internalId = useId()
  const providedDisabled = useDisabled()

  let { asChild, id: theirId, children, ...theirProps }: DescriptionProps = $props()

  const id = $derived(theirId ?? `headlessui-description-${internalId}`)
  const { register } = useDescriptionContext()
  $effect(() => {
    id
    return untrack(() => register(id))
  })

  const disabled = $derived(providedDisabled.current)
  const slot = $derived({ disabled })
  const ourProps = $derived(renderProps([theirProps, { id }], { slot }))
</script>

{#if ourProps}
  {#if asChild}
    {#if children}{@render children({ slot, props: ourProps })}{/if}
  {:else}
    <button {...ourProps}>
      {#if children}{@render children({ slot })}{/if}
    </button>
  {/if}
{/if}
