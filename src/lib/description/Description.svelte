<script lang="ts" context="module">
  import type { SvelteHTMLElements } from "svelte/elements"
  import { getContext, setContext, untrack, type Snippet } from "svelte"

  export type DescriptionProps<TTag extends keyof SvelteHTMLElements = typeof DEFAULT_DESCRIPTION_TAG> =
    SvelteHTMLElements[TTag] & {
      as?: TTag
      children?: Snippet<
        [
          {
            disabled: boolean
          },
        ]
      >
    }

  const DEFAULT_DESCRIPTION_TAG = "p" as const

  export type DescriptionContext = {
    describedBy?: string
    register: (id: string) => void
    unregister: (id: string) => void
  }

  export const createDescriptionContext = () => {
    let describedBy = $state<string | undefined>()

    setContext<DescriptionContext>("Description", {
      get describedBy() {
        return describedBy
      },
      register(id) {
        describedBy = untrack(() => (describedBy === undefined ? id : `${describedBy} ${id}`.trim()))
      },
      unregister(id) {
        describedBy = untrack(() =>
          describedBy
            ?.split(" ")
            .filter((value) => value !== id)
            .join(" ")
        )
      },
    })
  }

  export const getDescriptionContext = () => getContext<DescriptionContext>("Description")

  const validateDescriptionContext = () => {
    const context = getDescriptionContext()
    if (context === undefined) {
      const err = new Error("You used a <Description /> component, but it is not inside a relevant parent.")
      if (Error.captureStackTrace) Error.captureStackTrace(err, validateDescriptionContext)
      throw err
    }
    return context
  }
</script>

<script lang="ts" generics="TTag extends keyof SvelteHTMLElements">
  import { htmlid } from "../utils/id.js"
  import { stateFromSlot } from "../utils/state.js"
  import { getDisabledContext } from "../utils/disabled.js"

  const internalId = htmlid()
  const providedDisabled = getDisabledContext()

  let { as, id = `headlessui-description-${internalId}`, children, ...theirProps }: DescriptionProps<TTag> = $props()

  const context = validateDescriptionContext()

  $effect(() => {
    context.register(id)
    const registeredId = id
    return () => {
      context.unregister(registeredId)
    }
  })

  const disabled = $derived(providedDisabled?.disabled || false)
  const slot = $derived({ disabled })
  const ourProps = $derived({ id, ...stateFromSlot(slot) })
</script>

<svelte:element this={as ?? DEFAULT_DESCRIPTION_TAG} {...ourProps} {...theirProps}>
  {#if children}{@render children(slot)}{/if}
</svelte:element>
