<script lang="ts" generics="TTag extends keyof svelteHTML.IntrinsicElements">
  import { createDescriptionContext } from "$lib/description/Description.svelte"
  import { createLabelContext } from "$lib/label/Label.svelte"
  import { getDisabledContext } from "$lib/utils/disabled.js"
  import { createIdContext } from "$lib/utils/id.js"
  import { stateFromSlot } from "$lib/utils/state.js"
  import { nanoid } from "nanoid"
  import { getContext, setContext, type Snippet } from "svelte"

  const DEFAULT_FIELD_TAG = "div" as const

  type FieldProps<TTag extends keyof svelteHTML.IntrinsicElements = typeof DEFAULT_FIELD_TAG> =
    svelteHTML.IntrinsicElements[TTag] & {
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

  let { as, disabled: ownDisabled = false, children, ...theirProps }: FieldProps<TTag> = $props()

  const inputId = `headlessui-control-${nanoid(8)}`
  createIdContext(inputId)

  createLabelContext()
  createDescriptionContext()

  const providedDisabled = getDisabledContext()
  const disabled = $derived(providedDisabled?.disabled || ownDisabled)

  setContext("Disabled", {
    get disabled() {
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
  {#if children}
    {@render children(slot)}
  {/if}
</svelte:element>
