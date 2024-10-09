<script lang="ts" module>
  import type { ElementType, Props } from "../utils/types.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  const DEFAULT_FIELDSET_TAG = "fieldset" as const

  type FieldsetRenderPropArg = {}
  type FieldsetPropsWeControl = "aria-labelledby" | "aria-disabled" | "role"

  export type FieldsetProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_FIELDSET_TAG],
    FieldsetRenderPropArg,
    FieldsetPropsWeControl,
    {
      disabled?: boolean
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import { setContext } from "svelte"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useLabels } from "../label/context.svelte.js"
  import ElementOrComponent from "../utils/ElementOrComponent.svelte"

  let { element = $bindable(), disabled: ownDisabled = false, ...theirProps }: FieldsetProps<TTag> = $props()

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

<ElementOrComponent {ourProps} {theirProps} {slot} defaultTag={DEFAULT_FIELDSET_TAG} name="Fieldset" bind:element />
