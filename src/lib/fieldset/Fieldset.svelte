<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_FIELDSET_TAG = "fieldset" as const

  type FieldsetPropsWeControl = "aria-labelledby" | "aria-disabled" | "role"

  export type FieldsetProps = Props<
    typeof DEFAULT_FIELDSET_TAG,
    {},
    {
      element?: HTMLElement
      disabled?: boolean
    }
  >
</script>

<script lang="ts">
  import { setContext } from "svelte"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useLabels } from "$lib/label/context.svelte.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  let { element = $bindable(), disabled: ownDisabled = false, ...theirProps }: FieldsetProps = $props()

  const providedDisabled = useDisabled()
  const disabled = $derived(providedDisabled.current || ownDisabled)

  setContext("DisabledContext", {
    get value() {
      return disabled
    },
  })

  const labelledBy = useLabels()
  const slot = $derived({ disabled })
  const ourProps = $derived(
    !theirProps.asChild
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

<ElementOrComponent {ourProps} {theirProps} {slot} defaultTag={DEFAULT_FIELDSET_TAG} name="Fieldset" bind:element />
