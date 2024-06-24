<script lang="ts" context="module">
  import type { SvelteHTMLElements } from "svelte/elements"
  import type { EnsureArray, Props } from "$lib/utils/types.js"
  import type { ByComparator } from "$lib/hooks/use-by-comparator.js"

  const DEFAULT_COMBOBOX_TAG = "svelte:fragment" as const
  type ComboboxRenderPropArg<TValue, TActive = TValue> = {
    open: boolean
    disabled: boolean
    activeIndex: number | null
    activeOption: TActive | null
    value: TValue
  }

  export type CheckboxProps<
    TValue,
    TMultiple extends boolean | undefined,
    TTag extends keyof SvelteHTMLElements = typeof DEFAULT_COMBOBOX_TAG,
  > = Props<
    TTag,
    ComboboxRenderPropArg<NoInfer<TValue>>,
    "value" | "defaultValue" | "multiple" | "onChange" | "by",
    {
      value?: TMultiple extends true ? EnsureArray<TValue> : TValue
      defaultValue?: TMultiple extends true ? EnsureArray<NoInfer<TValue>> : NoInfer<TValue>

      onChange?(value: TMultiple extends true ? EnsureArray<NoInfer<TValue>> : NoInfer<TValue> | null): void
      by?: ByComparator<TMultiple extends true ? EnsureArray<NoInfer<TValue>>[number] : NoInfer<TValue>>

      /** @deprecated The `<Combobox />` is now nullable default */
      nullable?: boolean

      multiple?: TMultiple
      disabled?: boolean
      form?: string
      name?: string
      immediate?: boolean
      virtual?: {
        options: NoInfer<TValue>[]
        disabled?: (value: NoInfer<TValue>) => boolean
      } | null

      onClose?(): void

      __demoMode?: boolean
    }
  >
</script>

<script lang="ts" generics="TTag extends keyof SvelteHTMLElements, TType">
  import { useDisabled } from "../internal/disabled.js"

  const providedDisabled = useDisabled()
  let {
    as,
    value: controlledValue,
    defaultValue: _defaultValue,
    onChange: controlledOnChange,
    form,
    name,
    by,
    disabled = ownDisabled = false,
    onClose,
    __demoMode = false,
    multiple = false,
    immediate = false,
    virtual = null,
    // Deprecated, but let's pluck it from the props such that it doesn't end up
    // on the `Fragment`
    nullable: _nullable,
    ...theirProps
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

  const disabled = $derived(providedDisabled?.disabled || ownDisabled)

  const { hoverAction: hover, isHovered } = $derived(createHover({ isDisabled: disabled }))
  const ap = $derived(createActivePress({ disabled }))
  const fr = createFocusRing({ autofocus })

  const labelContext = getLabelContext()
  const labelledBy = $derived(labelContext?.labelledBy)

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
    focus: fr.focusVisible,
    active: ap.pressed,
    hover: $isHovered,
    autofocus: autofocus ?? false,
    disabled,
    indeterminate,
  })

  const ownProps = $derived({
    id,
    role: "checkbox",
    "aria-checked": indeterminate ? ("mixed" as "mixed") : checked ? true : false,
    "aria-labelledby": labelledBy,
    "aria-describedby": undefined,
    "aria-disabled": disabled ? true : undefined,
    tabindex: disabled ? undefined : 0,
    onkeyup: disabled ? undefined : handleKeyUp,
    onkeypress: disabled ? undefined : handleKeyPress,
    onclick: disabled ? undefined : handleClick,
    ...stateFromSlot(slot),
  })

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
<svelte:element
  this={as ?? DEFAULT_CHECKBOX_TAG}
  use:hover
  use:ap.activePressAction
  use:fr.focusRingAction
  {...ownProps}
  {...theirProps}
>
  {#if children}{@render children(slot)}{/if}
</svelte:element>
