<script lang="ts" context="module">
  import type { ElementType, Props } from "$lib/utils/types.js"

  let DEFAULT_CHECKBOX_TAG = "span" as const
  type CheckboxRenderPropArg = {
    checked: boolean
    changing: boolean
    focus: boolean
    active: boolean
    hover: boolean
    autofocus: boolean
    disabled: boolean
    indeterminate: boolean
  }
  type CheckboxPropsWeControl =
    | "aria-checked"
    | "aria-describedby"
    | "aria-disabled"
    | "aria-labelledby"
    | "role"
    | "tabIndex"

  export type CheckboxProps<TTag extends ElementType = typeof DEFAULT_CHECKBOX_TAG, TType = string> = Props<
    TTag,
    CheckboxRenderPropArg,
    CheckboxPropsWeControl,
    {
      id?: string
      value?: TType
      disabled?: boolean
      indeterminate?: boolean

      checked?: boolean
      defaultChecked?: boolean
      autoFocus?: boolean
      form?: string
      name?: string
      onChange?: (checked: boolean) => void
    }
  >
</script>

<script lang="ts" generics="TType, TTag extends ElementType = typeof DEFAULT_CHECKBOX_TAG">
  import { tick } from "svelte"
  import { attemptSubmit } from "../utils/form.js"
  import { getIdContext, htmlid } from "../utils/id.js"
  import { useActivePress } from "../hooks/use-active-press.svelte.js"
  import { useFocusRing } from "../hooks/use-focus-ring.svelte.js"
  import FormFields from "../internal/FormFields.svelte"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useLabelledBy } from "$lib/label/Label.svelte"
  import { useDescribedBy } from "$lib/description/Description.svelte"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const internalId = htmlid()
  const providedId = getIdContext()
  const providedDisabled = useDisabled()

  let {
    ref = $bindable(),
    id = providedId || `headlessui-checkbox-${internalId}`,
    value,
    disabled: ownDisabled = false,
    indeterminate = false,
    defaultChecked,
    checked = $bindable(defaultChecked ?? false),
    autofocus,
    form,
    name,
    onchange,
    ...theirProps
  }: { as?: TTag } & CheckboxProps<TTag, TType> = $props()

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

  const ourProps = $derived(
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
      pressProps
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
<ElementOrComponent
  {ourProps}
  {theirProps}
  {slot}
  defaultTag={DEFAULT_CHECKBOX_TAG}
  name="Checkbox"
  bind:ref
  bind:value
/>
