<script lang="ts" module>
  import type { ElementType, Props } from "../utils/types.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  const DEFAULT_CHECKBOX_TAG = "span" as const
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

  export type CheckboxProps<TTag extends ElementType = undefined, TType = string> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_CHECKBOX_TAG],
    CheckboxRenderPropArg,
    CheckboxPropsWeControl,
    {
      value?: TType
      disabled?: boolean
      indeterminate?: boolean

      checked?: boolean
      defaultChecked?: boolean
      autofocus?: boolean
      form?: string
      name?: string
      onchange?: (checked: boolean) => void
    }
  >
</script>

<script lang="ts" generics="TType, TTag extends ElementType = undefined">
  import { tick } from "svelte"
  import { attemptSubmit } from "../utils/form.js"
  import { useProvidedId, htmlid } from "../utils/id.js"
  import { useActivePress } from "../hooks/use-active-press.svelte.js"
  import { useFocusRing } from "../hooks/use-focus-ring.svelte.js"
  import FormFields from "../internal/FormFields.svelte"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useLabelledBy } from "../label/context.svelte.js"
  import { useDescribedBy } from "../description/context.svelte.js"
  import { useHover } from "../hooks/use-hover.svelte.js"
  import { mergeProps } from "../utils/render.js"
  import ElementOrComponent from "../utils/ElementOrComponent.svelte"
  import { useControllable } from "../hooks/use-controllable.svelte.js"

  const internalId = htmlid()
  const providedId = useProvidedId()
  const providedDisabled = useDisabled()

  let {
    id = providedId || `headlessui-checkbox-${internalId}`,
    disabled: theirDisabled = false,
    autofocus = false,
    checked: controlledChecked = $bindable(),
    defaultChecked: _defaultChecked,
    onchange: controlledOnChange,
    name,
    value,
    form,
    indeterminate = false,
    element = $bindable(),
    ...theirProps
  }: CheckboxProps<TTag, TType> = $props()

  const defaultChecked = _defaultChecked
  const controllable = useControllable(
    {
      get controlledValue() {
        return controlledChecked
      },
      set controlledValue(checked) {
        controlledChecked = checked
      },
    },
    controlledOnChange,
    defaultChecked ?? false
  )
  const { value: checked, onchange } = $derived(controllable)

  const disabled = $derived(providedDisabled.current || theirDisabled)

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
    onchange?.(!checked)
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
  bind:element
  bind:value
/>
