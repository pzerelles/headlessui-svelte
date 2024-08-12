<script lang="ts" context="module">
  import { tick, type Snippet } from "svelte"
  import type { Props, PropsOf, RefType, TagType } from "$lib/utils/types.js"

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

  export type MenuButtonProps<TTag extends TagType = typeof DEFAULT_BUTTON_TAG> = Props<
    TTag,
    ButtonRenderPropArg,
    ButtonPropsWeControl,
    {
      disabled?: boolean
      autofocus?: boolean
      ref?: RefType<TTag> | null
    }
  >

  export type MenuButtonChildren = Snippet<[ButtonRenderPropArg]>
</script>

<script lang="ts" generics="TTag extends TagType">
  import { useId } from "$lib/hooks/use-id.js"
  import { Focus } from "$lib/utils/calculate-active-index.js"
  import { useFocusRing } from "$lib/hooks/use-focus-ring.svelte.js"
  import { useActivePress } from "$lib/hooks/use-active-press.svelte.js"
  import { useResolveButtonType } from "$lib/hooks/use-resolve-button-type.svelte.js"
  import { useFloating } from "$lib/internal/floating.svelte.js"
  import { stateFromSlot } from "$lib/utils/state.js"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import { MenuStates, useMenuContext } from "./Menu.svelte"
  import { untrack } from "svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const internalId = useId()
  let {
    as = DEFAULT_BUTTON_TAG as TTag,
    ref = $bindable(),
    id = `headlessui-menu-button-${internalId}` as PropsOf<TTag>["id"],
    disabled = false,
    autofocus = false,
    children,
    ...theirProps
  }: MenuButtonProps<TTag> = $props()
  const _state = useMenuContext("MenuButton")
  const { setReference, getReferenceProps: getFloatingReferenceProps } = useFloating()
  $effect(() => {
    untrack(() => _state.setButtonElement(ref ? (ref as HTMLButtonElement) : null))
    setReference(ref)
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
      return { type: theirProps.type, as }
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
      pressProps,
      stateFromSlot(slot)
    )
  )
</script>

<ElementOrComponent {as} bind:ref {...ourProps} {...theirProps} {slot} {children} />
