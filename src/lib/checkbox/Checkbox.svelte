<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

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
    | "tabindex"
    | "class"

  export type CheckboxProps<T = string> = Props<
    "span",
    CheckboxRenderPropArg,
    CheckboxPropsWeControl,
    {
      asChild?: boolean
      value?: T
      disabled?: boolean
      indeterminate?: boolean
      checked?: boolean
      defaultChecked?: boolean
      form?: string
      name?: string
      onchange?: (checked: boolean) => void
    }
  >
</script>

<script lang="ts" generics="T = string">
  import { tick } from "svelte"
  import { attemptSubmit } from "../utils/form.js"
  import { useProvidedId, htmlid } from "../utils/id.js"
  import { useActivePress } from "../hooks/use-active-press.svelte.js"
  import { useFocusRing } from "../hooks/use-focus-ring.svelte.js"
  import FormFields from "../internal/FormFields.svelte"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useLabelledBy } from "$lib/label/context.svelte.js"
  import { useDescribedBy } from "$lib/description/context.svelte.js"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { renderProps } from "$lib/utils/render.js"
  import { useControllable } from "$lib/hooks/use-controllable.svelte.js"

  const internalId = htmlid()
  const providedId = useProvidedId()
  const providedDisabled = useDisabled()

  let {
    asChild,
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
    children,
    ...theirProps
  }: CheckboxProps<T> = $props()

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
        return autofocus ?? undefined
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
    renderProps(
      [
        theirProps,
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
      ],
      { slot }
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
{#if ourProps}
  {#if asChild}
    {#if children}{@render children({ slot, props: ourProps })}{/if}
  {:else}
    <span {...ourProps}>
      {#if children}{@render children({ slot })}{/if}
    </span>
  {/if}
{/if}
