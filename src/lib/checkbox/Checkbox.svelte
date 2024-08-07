<script lang="ts" context="module">
  import type { SvelteHTMLElements } from "svelte/elements"

  export type CheckboxProps<
    TType = string,
    TTag extends keyof SvelteHTMLElements = typeof DEFAULT_CHECKBOX_TAG,
  > = SvelteHTMLElements[TTag] & {
    as?: TTag
    value?: TType
    disabled?: boolean
    indeterminate?: boolean
    checked?: boolean
    defaultChecked?: boolean
    autofocus?: boolean
    form?: string
    name?: string
    onchange?: (checked: boolean) => void
    children?: Snippet<
      [
        {
          checked: boolean
          changing: boolean
          focus: boolean
          active: boolean
          hover: boolean
          autofocus: boolean
          disabled: boolean
          indeterminate: boolean
        },
      ]
    >
  }

  const DEFAULT_CHECKBOX_TAG = "div" as const
</script>

<script lang="ts" generics="TTag extends keyof SvelteHTMLElements, TType">
  import { tick, type Snippet } from "svelte"
  import { attemptSubmit } from "../utils/form.js"
  import { getIdContext, htmlid } from "../utils/id.js"
  import { useActivePress } from "../hooks/use-active-press.svelte.js"
  import { useFocusRing } from "../hooks/use-focus-ring.svelte.js"
  import FormFields from "../internal/FormFields.svelte"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { stateFromSlot } from "../utils/state.js"
  import { useLabelledBy } from "$lib/label/Label.svelte"
  import { useDescribedBy } from "$lib/description/Description.svelte"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"

  const internalId = htmlid()
  const providedId = getIdContext()
  const providedDisabled = useDisabled()

  let {
    id = providedId || `headlessui-checkbox-${internalId}`,
    as,
    value,
    disabled: ownDisabled = false,
    indeterminate = false,
    defaultChecked,
    checked = $bindable(defaultChecked ?? false),
    autofocus,
    form,
    name,
    onchange,
    children,
    ...theirProps
  }: CheckboxProps<TType, TTag> = $props()

  const disabled = $derived(providedDisabled.value || ownDisabled)

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
  const { isFocusVisible: focus, focusProps } = $derived(
    useFocusRing({
      get autofocus() {
        return autofocus
      },
    })
  )

  const labelledBy = useLabelledBy()
  const describedBy = useDescribedBy()

  let changing = $state(false)

  const toggle = () => {
    changing = true
    checked = !checked
    onchange?.(checked)
    tick().then(() => {
      changing = false
    })
  }

  const handleClick = (event: MouseEvent) => {
    if (disabled) return event.preventDefault()
    event.preventDefault()
    toggle()
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === " ") {
      event.preventDefault()
      toggle()
    } else if (event.key === "Enter") {
      if (event.currentTarget) attemptSubmit(event.currentTarget as HTMLElement)
    }
  }

  const handleKeyPress = (event: KeyboardEvent) => event.preventDefault()

  const slot = $derived({
    checked,
    changing,
    focus,
    active,
    hover,
    autofocus: autofocus ?? false,
    disabled,
    indeterminate,
  })

  const ownProps = $derived(
    mergeProps(
      {
        id,
        role: "checkbox",
        "aria-checked": indeterminate ? ("mixed" as "mixed") : checked ? true : false,
        "aria-labelledby": labelledBy.value,
        "aria-describedby": describedBy.value,
        "aria-disabled": disabled ? true : undefined,
        tabindex: disabled ? undefined : 0,
        onkeyup: disabled ? undefined : handleKeyUp,
        onkeypress: disabled ? undefined : handleKeyPress,
        onclick: disabled ? undefined : handleClick,
      },
      focusProps,
      hoverProps,
      pressProps,
      stateFromSlot(slot)
    )
  )

  const reset = $derived(() => {
    if (defaultChecked === undefined) return
    return onchange?.(defaultChecked)
  })
</script>

{#if name}
  <FormFields
    {disabled}
    data={{ [name]: value || "on" }}
    overrides={{ type: "checkbox", checked }}
    {form}
    onReset={reset}
  />
{/if}
<svelte:element this={as ?? DEFAULT_CHECKBOX_TAG} {...ownProps} {...theirProps}>
  {#if children}{@render children(slot)}{/if}
</svelte:element>
