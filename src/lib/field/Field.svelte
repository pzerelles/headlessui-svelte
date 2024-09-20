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
  import { provideDisabled } from "../hooks/use-disabled.js"
  import { createIdContext } from "../utils/id.js"
  import { nanoid } from "nanoid"
  import { useLabels } from "$lib/label/context.svelte.js"
  import { useDescriptions } from "$lib/description/context.svelte.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import FormFieldsProvider from "$lib/internal/FormFieldsProvider.svelte"

  let {
    ref = $bindable(),
    disabled: ownDisabled = false,
    children,
    ...theirProps
  }: { as?: TTag } & FieldProps<TTag> = $props()

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

{#snippet wrapper(args: Parameters<Exclude<typeof children, undefined>>[0])}
  <FormFieldsProvider>
    {#if children}{@render children(args)}{/if}
  </FormFieldsProvider>
{/snippet}

<ElementOrComponent
  {ourProps}
  theirProps={{ ...theirProps, children: wrapper }}
  {slot}
  defaultTag={DEFAULT_FIELD_TAG}
  name="Field"
  bind:ref
/>
