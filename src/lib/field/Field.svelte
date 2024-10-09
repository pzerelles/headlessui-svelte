<script lang="ts" module>
  import type { ElementType, Props } from "../utils/types.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  let DEFAULT_FIELD_TAG = "div" as const

  type FieldRenderPropArg = {}
  type FieldPropsWeControl = never

  export type FieldProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_FIELD_TAG],
    FieldRenderPropArg,
    FieldPropsWeControl,
    {
      disabled?: boolean
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import { provideDisabled } from "../hooks/use-disabled.js"
  import { createIdContext } from "../utils/id.js"
  import { nanoid } from "nanoid"
  import { useLabels } from "../label/context.svelte.js"
  import { useDescriptions } from "../description/context.svelte.js"
  import ElementOrComponent from "../utils/ElementOrComponent.svelte"
  import FormFieldsProvider from "../internal/FormFieldsProvider.svelte"

  let { element = $bindable(), disabled: ownDisabled = false, children, ...theirProps }: FieldProps<TTag> = $props()

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
  bind:element
/>
