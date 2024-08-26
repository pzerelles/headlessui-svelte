<script lang="ts" module>
  import type { ElementType, Props } from "$lib/utils/types.js"

  const DEFAULT_INPUT_TAG = "input" as const

  type InputRenderPropArg = {
    disabled: boolean
    hover: boolean
    focus: boolean
    autofocus: boolean
    invalid: boolean
  }
  type InputPropsWeControl = "aria-labelledby" | "aria-describedby"

  export type InputProps<TTag extends ElementType = typeof DEFAULT_INPUT_TAG, TValue = string> = Props<
    TTag,
    InputRenderPropArg,
    InputPropsWeControl,
    {
      id?: string
      value?: TValue
      disabled?: boolean
      invalid?: boolean
      autofocus?: boolean
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_INPUT_TAG, TValue = string">
  import { htmlid } from "../utils/id.js"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useProvidedId } from "$lib/internal/id.js"
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
    ref = $bindable(),
    value = $bindable(),
    id = providedId?.value || `headlessui-input-${internalId}`,
    disabled: theirDisabled = false,
    autofocus = false,
    invalid = false,
    ...theirProps
  }: { as?: TTag; value?: TValue } & InputProps<TTag, TValue> = $props()
  const disabled = $derived(providedDisabled?.value ?? theirDisabled)

  const labelledBy = useLabelledBy()
  const describedBy = useDescribedBy()

  const { isHovered: hover, hoverProps } = $derived(
    useHover({
      get disabled() {
        return disabled
      },
    })
  )
  const { isFocusVisible: focus, focusProps } = $derived(
    useFocusRing({
      get autofocus() {
        return autofocus
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

  const slot = $derived({ disabled, invalid, hover, focus, autofocus } satisfies InputRenderPropArg)
</script>

<ElementOrComponent {ourProps} {theirProps} {slot} defaultTag={DEFAULT_INPUT_TAG} name="Input" bind:ref bind:value />
