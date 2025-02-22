<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  let DEFAULT_FIELD_TAG = "div" as const

  export type FieldOwnProps = {
    element?: HTMLElement
    disabled?: boolean
  }

  export type FieldProps = Props<typeof DEFAULT_FIELD_TAG, {}, FieldOwnProps>
</script>

<script lang="ts">
  import { provideDisabled } from "../hooks/use-disabled.js"
  import { createIdContext } from "../utils/id.js"
  import { nanoid } from "nanoid"
  import { useLabels } from "$lib/label/context.svelte.js"
  import { useDescriptions } from "$lib/description/context.svelte.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import FormFieldsProvider from "$lib/internal/FormFieldsProvider.svelte"

  let { element = $bindable(), disabled: ownDisabled = false, children, ...theirProps }: FieldProps = $props()

  const inputId = `headlessui-control-${nanoid(8)}`
  createIdContext(inputId)

  useLabels()
  useDescriptions()

  const disabledContext = provideDisabled(() => ownDisabled)
  const { current: disabled } = $derived(disabledContext)

  const slot = $derived({ disabled })

  const ourProps = $derived({
    disabled: disabled || undefined,
    "aria-disabled": disabled || undefined,
  })
</script>

{#snippet wrapper(args: { props: Record<string, any> })}
  <FormFieldsProvider>
    {@render children?.(args)}
  </FormFieldsProvider>
{/snippet}

<ElementOrComponent
  {ourProps}
  theirProps={{ ...theirProps, children: wrapper }}
  slots={slot}
  defaultTag={DEFAULT_FIELD_TAG}
  name="Field"
  bind:element
/>
