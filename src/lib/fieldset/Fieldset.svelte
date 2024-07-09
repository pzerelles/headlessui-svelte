<script lang="ts" context="module">
  import type { SvelteHTMLElements } from "svelte/elements"

  export type FieldsetProps<TTag extends keyof SvelteHTMLElements = typeof DEFAULT_FIELDSET_TAG> =
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

  const DEFAULT_FIELDSET_TAG = "fieldset" as const
</script>

<script lang="ts" generics="TTag extends keyof SvelteHTMLElements">
  import { setContext, type Snippet } from "svelte"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useLabels } from "$lib/label/Label.svelte"

  let { as, disabled: ownDisabled = false, children, ...theirProps }: FieldsetProps<TTag> = $props()

  const providedDisabled = useDisabled()
  const disabled = $derived(providedDisabled.value || ownDisabled)

  setContext("Disabled", {
    get disabled() {
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
