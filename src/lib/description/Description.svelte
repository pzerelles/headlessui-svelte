<script lang="ts" context="module">
  import type { SvelteHTMLElements } from "svelte/elements"
  import { getContext, setContext, type Snippet } from "svelte"
  import type { ElementType, Props } from "$lib/utils/types.js"

  let DEFAULT_DESCRIPTION_TAG = "p" as const

  export type DescriptionProps<TTag extends ElementType = typeof DEFAULT_DESCRIPTION_TAG> = Props<TTag>

  interface SharedData {
    slot?: {}
    name?: string
    props?: Record<string, any>
  }

  export type DescriptionContext = {
    value: string | undefined
    register(value: string): () => void
  } & SharedData

  export function useDescriptionContext() {
    let context = getContext<DescriptionContext>("DescriptionContext")
    if (context === null) {
      let err = new Error("You used a <Description /> component, but it is not inside a relevant parent.")
      if (Error.captureStackTrace) Error.captureStackTrace(err, useDescriptionContext)
      throw err
    }
    return context
  }

  export function useDescribedBy() {
    const context = getContext<DescriptionContext>("DescriptionContext")
    return {
      get value() {
        return context?.value
      },
    }
  }

  export const useDescriptions = (options: SharedData & { inherit?: boolean } = {}) => {
    const { slot, name, props, inherit } = $derived(options)

    let descriptionIds = $state<string[]>([])

    const value = $derived(descriptionIds.length > 0 ? descriptionIds.join(" ") : undefined)

    const context: DescriptionContext = {
      get slot() {
        return slot
      },
      get name() {
        return name
      },
      get props() {
        return props
      },
      get value() {
        return value
      },
      register(value) {
        descriptionIds.push(value)
        return () => {
          const clone = descriptionIds.slice()
          const idx = clone.indexOf(value)
          if (idx !== -1) clone.splice(idx, 1)
          descriptionIds = clone
          return descriptionIds
        }
      },
    }
    setContext<DescriptionContext>("DescriptionContext", context)
    return context
  }
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_DESCRIPTION_TAG">
  import { htmlid } from "../utils/id.js"
  import { stateFromSlot } from "../utils/state.js"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { onMount } from "svelte"

  const internalId = htmlid()
  const providedDisabled = useDisabled()

  let {
    as,
    id = `headlessui-description-${internalId}`,
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
  {#if children}{@render children(slot)}{/if}
</svelte:element>
