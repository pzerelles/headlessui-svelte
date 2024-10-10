<script lang="ts" module>
  import { useId } from "$lib/hooks/use-id.js"
  import { useProvidedId } from "$lib/utils/id.js"
  import type { Props } from "$lib/utils/types.js"
  import { ListboxStates, useActions, useData } from "./Listbox.svelte"
  import { attemptSubmit } from "$lib/utils/form.js"
  import { Focus } from "$lib/utils/calculate-active-index.js"
  import { useFocusRing } from "$lib/hooks/use-focus-ring.svelte.js"
  import { useActivePress } from "$lib/hooks/use-active-press.svelte.js"
  import { useResolveButtonType } from "$lib/hooks/use-resolve-button-type.svelte.js"
  import { useFloatingReference, useFloatingReferenceProps } from "$lib/internal/floating.svelte.js"
  import { stateFromSlot } from "$lib/utils/state.js"
  import type { SvelteHTMLElements } from "svelte/elements"
  import { useLabelledBy } from "$lib/label/context.svelte.js"
  import { useDescribedBy } from "$lib/description/context.svelte.js"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

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

  export type ListboxButtonProps = Props<
    typeof DEFAULT_BUTTON_TAG,
    ButtonRenderPropArg,
    {
      element?: HTMLElement
      id?: string
      autofocus?: boolean
      disabled?: boolean
    }
  >
</script>

<script lang="ts">
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
  }: ListboxButtonProps = $props()
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
      return { type: theirProps.type ?? undefined, as: DEFAULT_BUTTON_TAG }
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
