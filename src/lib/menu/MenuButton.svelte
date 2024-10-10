<script lang="ts" module>
  import { tick } from "svelte"
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_BUTTON_TAG = "button" as const
  type ButtonRenderPropArg = {
    open: boolean
    active: boolean
    hover: boolean
    focus: boolean
    disabled: boolean
    autofocus: boolean
  }
  type ButtonPropsWeControl = "aria-controls" | "aria-expanded" | "aria-haspopup"

  export type MenuButtonProps = Props<
    typeof DEFAULT_BUTTON_TAG,
    ButtonRenderPropArg,
    {
      element?: HTMLElement
      id?: string
      disabled?: boolean
      autofocus?: boolean
      type?: string
    }
  >
</script>

<script lang="ts">
  import { useId } from "$lib/hooks/use-id.js"
  import { Focus } from "$lib/utils/calculate-active-index.js"
  import { useFocusRing } from "$lib/hooks/use-focus-ring.svelte.js"
  import { useActivePress } from "$lib/hooks/use-active-press.svelte.js"
  import { useResolveButtonType } from "$lib/hooks/use-resolve-button-type.svelte.js"
  import { useFloatingReference, useFloatingReferenceProps } from "$lib/internal/floating.svelte.js"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import { MenuStates, useMenuContext } from "./context.svelte.js"
  import { untrack } from "svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const internalId = useId()
  let {
    element = $bindable(),
    id = `headlessui-menu-button-${internalId}`,
    disabled = false,
    autofocus = false,
    ...theirProps
  }: MenuButtonProps = $props()
  const _state = useMenuContext("MenuButton")
  const floatingReference = useFloatingReference()
  const { setReference } = $derived(floatingReference)
  const { getReferenceProps: getFloatingReferenceProps } = useFloatingReferenceProps()
  $effect(() => {
    untrack(() => _state.setButtonElement(element ? (element as HTMLButtonElement) : null))
    setReference(element)
  })

  const handleKeyDown = async (event: KeyboardEvent) => {
    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/#keyboard-interaction-13

      case " ":
      case "Enter":
      case "ArrowDown":
        event.preventDefault()
        event.stopPropagation()
        _state.openMenu()
        await tick()
        _state.goToItem({ focus: Focus.First })
        break

      case "ArrowUp":
        event.preventDefault()
        event.stopPropagation()
        _state.openMenu()
        await tick()
        _state.goToItem({ focus: Focus.Last })
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

  const handleClick = async (event: MouseEvent) => {
    //if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    if (disabled) return
    if (_state.menuState === MenuStates.Open) {
      _state.closeMenu()
      await tick()
      _state.buttonElement?.focus({ preventScroll: true })
    } else {
      event.preventDefault()
      _state.openMenu()
    }
  }

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
    open: _state.menuState === MenuStates.Open,
    active: active || _state.menuState === MenuStates.Open,
    disabled,
    hover,
    focus,
    autofocus: autofocus ?? false,
  } satisfies ButtonRenderPropArg)

  const buttonType = useResolveButtonType({
    get props() {
      return { type: theirProps.type, as: DEFAULT_BUTTON_TAG }
    },
    get ref() {
      return { current: _state.buttonElement }
    },
  })

  const ourProps = $derived(
    mergeProps(
      {
        ...getFloatingReferenceProps(),
        id,
        type: buttonType.type,
        "aria-haspopup": "menu",
        "aria-controls": _state.itemsElement?.id,
        "aria-expanded": _state.menuState === MenuStates.Open,
        disabled: disabled || undefined,
        autofocus,
        onkeydown: handleKeyDown,
        onkeyup: handleKeyUp,
        onclick: handleClick,
      },
      focusProps,
      hoverProps,
      pressProps
    )
  )
</script>

<ElementOrComponent {ourProps} {theirProps} {slot} defaultTag={DEFAULT_BUTTON_TAG} name="MenuButton" bind:element />
