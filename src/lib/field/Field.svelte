<script lang="ts" context="module">
  import type { SvelteHTMLElements } from "svelte/elements"

  export type FieldProps<TTag extends keyof SvelteHTMLElements = typeof DEFAULT_FIELD_TAG> =
    SvelteHTMLElements[TTag] & {
      as?: TTag
      disabled?: boolean
      children?: Snippet<
        [
          {
            disabled: boolean
          },
        ]
      >
    }

  const DEFAULT_FIELD_TAG = "div" as const
</script>

<script lang="ts" generics="TTag extends keyof SvelteHTMLElements">
  import { useDisabled } from "../hooks/use-disabled.js"
  import { createIdContext } from "../utils/id.js"
  import { stateFromSlot } from "../utils/state.js"
  import { nanoid } from "nanoid"
  import { setContext, type Snippet } from "svelte"
  import { useLabels } from "$lib/label/Label.svelte"
  import { useDescriptions } from "$lib/description/Description.svelte"

  let { as, disabled: ownDisabled = false, children, ...theirProps }: FieldProps<TTag> = $props()

  const inputId = `headlessui-control-${nanoid(8)}`
  createIdContext(inputId)

  useLabels()
  useDescriptions()

  const providedDisabled = useDisabled()
  const disabled = $derived(providedDisabled.value || ownDisabled)

  setContext("DisabledContext", {
    get value() {
      return disabled
    },
  })

  const slot = $derived({ disabled })

  const ourProps = $derived({
    disabled: disabled || undefined,
    "aria-disabled": disabled || undefined,
    ...stateFromSlot(slot),
  })
</script>

<svelte:element this={as ?? DEFAULT_FIELD_TAG} {...ourProps} {...theirProps}>
  {#if children}{@render children(slot)}{/if}
</svelte:element>
