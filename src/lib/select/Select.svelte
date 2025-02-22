<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  let DEFAULT_SELECT_TAG = "select" as const

  export type SelectRenderPropArg = {
    disabled: boolean
    hover: boolean
    focus: boolean
    active: boolean
    autofocus: boolean
    invalid: boolean
  }
  type SelectPropsWeControl = "aria-labelledby" | "aria-describedby"

  export type SelectOwnProps = {
    element?: HTMLElement
    id?: string
    disabled?: boolean
    invalid?: boolean
    autofocus?: boolean
  }

  export type SelectProps = Props<typeof DEFAULT_SELECT_TAG, SelectRenderPropArg, SelectOwnProps>
</script>

<script lang="ts">
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
    value = $bindable(),
    ...theirProps
  }: SelectProps = $props()

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

<ElementOrComponent
  {ourProps}
  {theirProps}
  slots={slot}
  defaultTag={DEFAULT_SELECT_TAG}
  name="Select"
  bind:element
  bind:value
/>
