<script lang="ts" context="module">
  import type { ElementType, Props } from "$lib/utils/types.js"
  let DEFAULT_FIELDSET_TAG = "fieldset" as const

  type FieldsetRenderPropArg = {}
  type FieldsetPropsWeControl = "aria-labelledby" | "aria-disabled" | "role"

  export type FieldsetProps<TTag extends ElementType = typeof DEFAULT_FIELDSET_TAG> = Props<
    TTag,
    FieldsetRenderPropArg,
    FieldsetPropsWeControl,
    {
      disabled?: boolean
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_FIELDSET_TAG">
  import { setContext, type Snippet } from "svelte"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useLabels } from "$lib/label/Label.svelte"

  let { as, disabled: ownDisabled = false, children, ...theirProps }: { as?: TTag } & FieldsetProps<TTag> = $props()

  const providedDisabled = useDisabled()
  const disabled = $derived(providedDisabled.value || ownDisabled)

  setContext("DisabledContext", {
    get value() {
      return disabled
    },
  })

  const tag = $state(as ?? DEFAULT_FIELDSET_TAG)
  const labelledBy = useLabels()
  const slot = $derived({ disabled })
  const ourProps = $derived(
    tag === "fieldset"
      ? {
          "aria-labelledby": labelledBy.value,
          disabled: disabled || undefined,
        }
      : {
          role: "group",
          "aria-labelledby": labelledBy.value,
          "aria-disabled": disabled || undefined,
        }
  )
</script>

<svelte:element this={tag} {...ourProps} {...theirProps}>
  {#if children}{@render children(slot)}{/if}
</svelte:element>
