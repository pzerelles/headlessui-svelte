<script lang="ts" module>
  import { useId } from "../hooks/use-id.js"
  import { useProvidedId } from "../utils/id.js"
  import type { ElementType, Props } from "../utils/types.js"
  import { ListboxStates, useActions, useData } from "./Listbox.svelte"
  import { attemptSubmit } from "../utils/form.js"
  import { Focus } from "../utils/calculate-active-index.js"
  import { useFocusRing } from "../hooks/use-focus-ring.svelte.js"
  import { useActivePress } from "../hooks/use-active-press.svelte.js"
  import { useResolveButtonType } from "../hooks/use-resolve-button-type.svelte.js"
  import { useFloatingReference, useFloatingReferenceProps } from "../internal/floating.svelte.js"
  import { stateFromSlot } from "../utils/state.js"
  import type { SvelteHTMLElements } from "svelte/elements"
  import { useLabelledBy } from "../label/context.svelte.js"
  import { useDescribedBy } from "../description/context.svelte.js"
  import { useHover } from "../hooks/use-hover.svelte.js"
  import { mergeProps } from "../utils/render.js"
  import ElementOrComponent from "../utils/ElementOrComponent.svelte"

  const DEFAULT_BUTTON_TAG = "button" as const
  type ButtonRenderPropArg = {
    disabled: boolean
    invalid: boolean
    hover: boolean
    focus: boolean
    autofocus: boolean
    open: boolean
    active: boolean
    value: any
  }
  type ButtonPropsWeControl = "aria-controls" | "aria-expanded" | "aria-haspopup" | "aria-labelledby" | "disabled"

  export type ListboxButtonProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_BUTTON_TAG],
    ButtonRenderPropArg,
    ButtonPropsWeControl,
    {
      autofocus?: boolean
      disabled?: boolean
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  const data = useData("ListboxButton")
  const actions = useActions("ListboxButton")

  const internalId = useId()
  const providedId = useProvidedId()
  let {
    element = $bindable(),
    id = providedId || `headlessui-listbox-button-${internalId}`,
    disabled: ownDisabled = false,
    autofocus = false,
    ...theirProps
  }: ListboxButtonProps<TTag> = $props()
  const { setReference } = useFloatingReference()
  const { getReferenceProps: getFloatingReferenceProps } = useFloatingReferenceProps()
  $effect(() => {
    data.buttonElement = element || null
    setReference(element)
  })

  const disabled = $derived(data.disabled || ownDisabled)

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/#keyboard-interaction-13

      case "Enter":
        if (event.currentTarget) attemptSubmit(event.currentTarget as HTMLElement)
        break

      case " ":
      case "ArrowDown":
        event.preventDefault()
        actions.openListbox()
        if (!data.value) actions.goToOption(Focus.First)
        break

      case "ArrowUp":
        event.preventDefault()
        actions.openListbox()
        if (!data.value) actions.goToOption(Focus.Last)
        break
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key) {
      case " ":
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault()
        break
    }
  }

  const handleClick = (event: MouseEvent) => {
    //if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    if (data.listboxState === ListboxStates.Open) {
      actions.closeListbox()
      data.buttonElement?.focus({ preventScroll: true })
    } else {
      event.preventDefault()
      actions.openListbox()
    }
  }

  // This is needed so that we can "cancel" the click event when we use the `Enter` key on a button.
  const handleKeyPress = (event: KeyboardEvent) => event.preventDefault()

  const labelledBy = useLabelledBy()
  const describedBy = useDescribedBy()

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

  const slot = $derived({
    open: data.listboxState === ListboxStates.Open,
    active: active || data.listboxState === ListboxStates.Open,
    disabled,
    invalid: data.invalid,
    value: data.value,
    hover,
    focus,
    autofocus: autofocus ?? false,
  } satisfies ButtonRenderPropArg)

  const buttonType = useResolveButtonType({
    get props() {
      return { type: theirProps.type, as: theirProps.as }
    },
    get ref() {
      return { current: data.buttonElement }
    },
  })

  const ourProps = $derived(
    mergeProps(
      {
        ...getFloatingReferenceProps(),
        id,
        type: buttonType.type,
        "aria-haspopup": "listbox",
        "aria-controls": data.optionsElement?.id,
        "aria-expanded": data.listboxState === ListboxStates.Open,
        "aria-labelledby": labelledBy.value,
        "aria-describedby": describedBy.value,
        disabled: disabled || undefined,
        autofocus,
        onkeydown: handleKeyDown,
        onkeyup: handleKeyUp,
        onkeypress: handleKeyPress,
        onclick: handleClick,
      },
      focusProps,
      hoverProps,
      pressProps,
      stateFromSlot(slot)
    )
  )
</script>

<ElementOrComponent {ourProps} {theirProps} {slot} defaultTag={DEFAULT_BUTTON_TAG} name="ListboxButton" bind:element />
