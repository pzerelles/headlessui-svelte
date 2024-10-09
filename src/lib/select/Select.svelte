<script lang="ts" module>
  import type { ElementType, Props } from "$lib/utils/types.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  let DEFAULT_SELECT_TAG = "select" as const

  type SelectRenderPropArg = {
    disabled: boolean
    hover: boolean
    focus: boolean
    active: boolean
    autofocus: boolean
    invalid: boolean
  }
  type SelectPropsWeControl = "aria-labelledby" | "aria-describedby"

  export type SelectProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_SELECT_TAG],
    SelectRenderPropArg,
    SelectPropsWeControl,
    {
      disabled?: boolean
      invalid?: boolean
      autofocus?: boolean
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import { useId } from "$lib/hooks/use-id.js"
  import { useProvidedId } from "$lib/utils/id.js"
  import { useDisabled } from "$lib/hooks/use-disabled.js"
  import { useFocusRing } from "$lib/hooks/use-focus-ring.svelte.js"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { useActivePress } from "$lib/hooks/use-active-press.svelte.js"
  import { useLabelledBy } from "$lib/label/context.svelte.js"
  import { useDescribedBy } from "$lib/description/context.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const internalId = useId()
  const providedId = useProvidedId()
  const providedDisabled = useDisabled()
  let {
    element = $bindable(),
    id = providedId || `headlessui-select-${internalId}`,
    disabled: theirDisabled = false,
    invalid = false,
    autofocus = false,
    ...theirProps
  }: SelectProps<TTag> = $props()

  const disabled = $derived(providedDisabled.current ?? theirDisabled)
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
  const { pressed: active, pressProps } = $derived(
    useActivePress({
      get disabled() {
        return disabled
      },
    })
  )

  const ourProps = $derived(
    mergeProps(
      {
        id,
        "aria-labelledby": labelledBy.value,
        "aria-describedby": describedBy.value,
        "aria-invalid": invalid ? "" : undefined,
        disabled: disabled || undefined,
        autofocus,
      },
      focusProps,
      hoverProps,
      pressProps
    )
  )

  const slot = $derived({
    disabled,
    invalid,
    hover,
    focus,
    active,
    autofocus,
  } satisfies SelectRenderPropArg)
</script>

<ElementOrComponent {ourProps} {theirProps} {slot} defaultTag={DEFAULT_SELECT_TAG} name="Select" bind:element />
