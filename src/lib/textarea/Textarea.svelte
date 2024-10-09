<script lang="ts" module>
  import type { ElementType, Props } from "$lib/utils/types.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  const DEFAULT_TEXTAREA_TAG = "textarea" as const

  type TextareaRenderPropArg = {
    disabled: boolean
    hover: boolean
    focus: boolean
    autofocus: boolean
    invalid: boolean
  }
  type TextareaPropsWeControl = "aria-labelledby" | "aria-describedby"

  export type TextareaProps<TTag extends ElementType = undefined, TValue = string> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_TEXTAREA_TAG],
    TextareaRenderPropArg,
    TextareaPropsWeControl,
    {
      value?: TValue
      disabled?: boolean
      invalid?: boolean
      autofocus?: boolean
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined, TValue = string">
  import { htmlid } from "../utils/id.js"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useProvidedId } from "$lib/utils/id.js"
  import { useLabelledBy } from "$lib/label/context.svelte.js"
  import { useDescribedBy } from "$lib/description/context.svelte.js"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { useFocusRing } from "$lib/hooks/use-focus-ring.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const internalId = htmlid()
  const providedId = useProvidedId()
  const providedDisabled = useDisabled()

  let {
    element = $bindable(),
    value = $bindable(),
    id = providedId || `headlessui-input-${internalId}`,
    disabled: theirDisabled = false,
    autofocus = false,
    invalid = false,
    ...theirProps
  }: TextareaProps<TTag, TValue> = $props()
  const disabled = $derived(providedDisabled.current || theirDisabled)

  const labelledBy = useLabelledBy()
  const describedBy = useDescribedBy()

  const { isFocusVisible: focus, focusProps } = $derived(
    useFocusRing({
      get autofocus() {
        return autofocus
      },
    })
  )
  const { isHovered: hover, hoverProps } = $derived(
    useHover({
      get disabled() {
        return disabled
      },
    })
  )

  const ourProps = $derived(
    mergeProps(
      {
        id,
        "aria-labelledby": labelledBy?.value,
        "aria-describedby": describedBy?.value,
        "aria-invalid": invalid ? "" : undefined,
        disabled: disabled || undefined,
        autofocus,
      },
      focusProps,
      hoverProps
    )
  )

  const slot = $derived({ disabled, invalid, hover, focus, autofocus } satisfies TextareaRenderPropArg)
</script>

<ElementOrComponent
  {ourProps}
  {theirProps}
  {slot}
  defaultTag={DEFAULT_TEXTAREA_TAG}
  name="Textarea"
  bind:element
  bind:value
/>
