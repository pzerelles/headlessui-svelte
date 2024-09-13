<script lang="ts" module>
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
  import { nanoid } from "nanoid"
  import { setContext } from "svelte"
  import { useLabels } from "$lib/label/context.svelte.js"
  import { useDescriptions } from "$lib/description/context.svelte.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import FormFieldsProvider from "$lib/internal/FormFieldsProvider.svelte"

  let {
    ref = $bindable(),
    disabled: ownDisabled = false,
    children: theirChildren,
    ...theirProps
  }: { as?: TTag } & FieldProps<TTag> = $props()

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
  })
</script>

{#snippet children(slot: FieldRenderPropArg, props: Record<string, any>)}
  <FormFieldsProvider>
    {#if theirChildren}{@render theirChildren(slot, props)}{/if}
  </FormFieldsProvider>
{/snippet}

<ElementOrComponent
  {ourProps}
  theirProps={{ ...theirProps, children }}
  {slot}
  defaultTag={DEFAULT_FIELD_TAG}
  name="Field"
  bind:ref
/>
