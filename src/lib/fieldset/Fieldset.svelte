<script lang="ts" module>
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
  import { setContext } from "svelte"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useLabels } from "$lib/label/context.svelte.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  let {
    ref = $bindable(),
    disabled: ownDisabled = false,
    ...theirProps
  }: { as?: TTag } & FieldsetProps<TTag> = $props()

  const providedDisabled = useDisabled()
  const disabled = $derived(providedDisabled.value || ownDisabled)

  setContext("DisabledContext", {
    get value() {
      return disabled
    },
  })

  const labelledBy = useLabels()
  const slot = $derived({ disabled })
  const ourProps = $derived(
    (theirProps.as ?? DEFAULT_FIELDSET_TAG) === "fieldset"
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

<ElementOrComponent {ourProps} {theirProps} {slot} defaultTag={DEFAULT_FIELDSET_TAG} name="Fieldset" bind:ref />
