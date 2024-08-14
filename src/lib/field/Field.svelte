<script lang="ts" context="module">
  import type { ElementType, Props } from "$lib/utils/types.js"

  let DEFAULT_FIELD_TAG = "div" as const

  type FieldRenderPropArg = {}
  type FieldPropsWeControl = never

  export type FieldProps<TTag extends ElementType = typeof DEFAULT_FIELD_TAG> = Props<
    TTag,
    FieldRenderPropArg,
    FieldPropsWeControl,
    {
      disabled?: boolean
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_FIELD_TAG">
  import { useDisabled } from "../hooks/use-disabled.js"
  import { createIdContext } from "../utils/id.js"
  import { stateFromSlot } from "../utils/state.js"
  import { nanoid } from "nanoid"
  import { setContext, type Snippet } from "svelte"
  import { useLabels } from "$lib/label/Label.svelte"
  import { useDescriptions } from "$lib/description/Description.svelte"

  let { as, disabled: ownDisabled = false, children, ...theirProps }: { as?: TTag } & FieldProps<TTag> = $props()

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
