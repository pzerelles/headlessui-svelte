<script lang="ts" module>
  import type { ElementType, Props, PropsOf } from "$lib/utils/types.js"

  const DEFAULT_SWITCH_TAG = "button" as const
  type SwitchRenderPropArg = {
    checked: boolean
    hover: boolean
    focus: boolean
    active: boolean
    autofocus: boolean
    changing: boolean
    disabled: boolean
  }
  type SwitchPropsWeControl = "aria-checked" | "aria-describedby" | "aria-labelledby" | "role"

  export type SwitchProps<TTag extends ElementType = typeof DEFAULT_SWITCH_TAG> = Props<
    TTag,
    SwitchRenderPropArg,
    SwitchPropsWeControl,
    {
      checked?: boolean
      defaultChecked?: boolean
      onchange?(checked: boolean): void
      name?: string
      value?: string
      form?: string
      autofocus?: boolean
      disabled?: boolean
      tabIndex?: number
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_SWITCH_TAG">
  import { useId } from "$lib/hooks/use-id.js"
  import { useDisabled } from "$lib/hooks/use-disabled.js"
  import { useProvidedId } from "$lib/utils/id.js"
  import { getContext, tick } from "svelte"
  import type { GroupContext } from "./SwitchGroup.svelte"
  import { attemptSubmit } from "$lib/utils/form.js"
  import { useLabelledBy } from "$lib/label/context.svelte.js"
  import { useDescribedBy } from "$lib/description/context.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import { useResolveButtonType } from "$lib/hooks/use-resolve-button-type.svelte.js"
  import { useFocusRing } from "$lib/hooks/use-focus-ring.svelte.js"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { useActivePress } from "$lib/hooks/use-active-press.svelte.js"
  import { useControllable } from "$lib/hooks/use-controllable.svelte.js"
  import FormFields from "$lib/internal/FormFields.svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const internalId = useId()
  const providedId = useProvidedId()
  const providedDisabled = useDisabled()
  let {
    ref = $bindable(),
    id = (providedId || `headlessui-switch-${internalId}`) as PropsOf<TTag>["id"],
    disabled: theirDisabled = false,
    checked: controlledChecked = $bindable(),
    defaultChecked: _defaultChecked,
    onchange: controlledOnChange,
    name,
    value,
    form,
    autofocus = false,
    tabIndex,
    ...theirProps
  }: { as?: TTag } & SwitchProps<TTag> = $props()
  const disabled = $derived(providedDisabled?.value ?? theirDisabled)
  const groupContext = getContext<GroupContext>("GroupContext")
  $effect(() => {
    if (groupContext) groupContext.switchElement = ref ?? null
  })

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

  let changing = $state(false)

  const toggle = () => {
    changing = true
    onchange?.(!checked)
    tick().then(() => {
      changing = false
    })
  }

  const handleClick = (event: MouseEvent) => {
    //if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    event.preventDefault()
    toggle()
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === " ") {
      event.preventDefault()
      toggle()
    } else if (event.key === "Enter") {
      attemptSubmit(event.currentTarget as HTMLElement)
    }
  }

  // This is needed so that we can "cancel" the click event when we use the `Enter` key on a button.
  const handleKeyPress = (event: KeyboardEvent) => event.preventDefault()

  let labelledBy = useLabelledBy()
  let describedBy = useDescribedBy()

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

  const slot = $derived({
    checked,
    disabled,
    hover,
    focus,
    active,
    autofocus,
    changing,
  } satisfies SwitchRenderPropArg)

  const buttonType = useResolveButtonType({
    get props() {
      return { type: theirProps.type, as: theirProps.as }
    },
    get ref() {
      return { current: ref }
    },
  })

  const ourProps = $derived(
    mergeProps(
      {
        id,
        role: "switch",
        type: buttonType.type,
        tabIndex: tabIndex === -1 ? 0 : (tabIndex ?? 0),
        "aria-checked": checked,
        "aria-labelledby": labelledBy.value,
        "aria-describedby": describedBy.value,
        disabled: disabled || undefined,
        autofocus,
        onclick: handleClick,
        onkeyup: handleKeyUp,
        onkeypress: handleKeyPress,
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

<ElementOrComponent {ourProps} {theirProps} {slot} defaultTag={DEFAULT_SWITCH_TAG} name="Switch" bind:ref />
