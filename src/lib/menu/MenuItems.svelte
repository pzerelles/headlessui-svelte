<script lang="ts" context="module">
  import type { ElementType, Props } from "$lib/utils/types.js"
  import { mergeProps, RenderFeatures, type PropsForFeatures } from "$lib/utils/render.js"
  import {
    useFloatingPanel,
    useFloatingPanelProps,
    useResolvedAnchor,
    type AnchorProps,
  } from "$lib/internal/floating.svelte.js"

  const DEFAULT_ITEMS_TAG = "div" as const
  type ItemsRenderPropArg = {
    open: boolean
  }
  type ItemsPropsWeControl = "aria-activedescendant" | "aria-labelledby" | "role" | "tabIndex"

  let ItemsRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

  export type MenuItemsProps<TTag extends ElementType = typeof DEFAULT_ITEMS_TAG> = Props<
    TTag,
    ItemsRenderPropArg,
    ItemsPropsWeControl,
    {
      id?: string
      anchor?: AnchorProps
      portal?: boolean
      modal?: boolean
      transition?: boolean
    } & PropsForFeatures<typeof ItemsRenderFeatures>
  >

  export type MenuItemsChildren = Snippet<[ItemsRenderPropArg]>
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_ITEMS_TAG">
  import { useId } from "$lib/hooks/use-id.js"
  import { getOwnerDocument } from "$lib/utils/owner.js"
  import { State, useOpenClosed } from "$lib/internal/open-closed.js"
  import { transitionDataAttributes, useTransition } from "$lib/hooks/use-transition.svelte.js"
  import { useOnDisappear } from "$lib/hooks/use-on-disappear.svelte.js"
  import { useScrollLock } from "$lib/hooks/use-scroll-lock.svelte.js"
  import { useInertOthers } from "$lib/hooks/use-inert-others.svelte.js"
  import { useDidElementMove } from "$lib/hooks/use-did-element-move.svelte.js"
  import { useDisposables } from "$lib/utils/disposables.js"
  import { Focus } from "$lib/utils/calculate-active-index.js"
  import { focusFrom, Focus as FocusManagementFocus, restoreFocusIfNecessary } from "$lib/utils/focus-management.js"
  import { useElementSize } from "$lib/hooks/use-element-size.svelte.js"
  import { tick, untrack, type Snippet } from "svelte"
  import Portal from "$lib/portal/Portal.svelte"
  import { MenuStates, useMenuContext } from "./context.svelte.js"
  import { useTreeWalker } from "$lib/hooks/use-tree-walker.svelte.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const internalId = useId()
  let {
    as = DEFAULT_ITEMS_TAG as TTag,
    ref = $bindable(),
    id = `headlessui-menu-items-${internalId}`,
    anchor: rawAnchor,
    portal = false,
    modal = true,
    transition = false,
    ...theirProps
  }: { as?: TTag } & MenuItemsProps<TTag> = $props()
  const anchor = $derived(useResolvedAnchor(rawAnchor))
  const _state = useMenuContext("MenuOptions")
  const floatingPanel = useFloatingPanel({
    get placement() {
      return anchor
    },
  })
  const { setFloating, style } = $derived(floatingPanel)
  const getFloatingPanelProps = useFloatingPanelProps()

  $effect(() => {
    untrack(() => _state.setItemsElement(ref || null))
    if (anchor) setFloating(ref)
  })
  const ownerDocument = $derived(getOwnerDocument(_state.itemsElement))

  // Always enable `portal` functionality, when `anchor` is enabled
  $effect(() => {
    if (anchor) {
      portal = true
    }
  })

  const usesOpenClosedState = useOpenClosed()
  const show = $derived(
    usesOpenClosedState !== null
      ? (usesOpenClosedState.value & State.Open) === State.Open
      : _state.menuState === MenuStates.Open
  )
  const _transition = useTransition({
    get enabled() {
      return transition
    },
    get element() {
      return ref
    },
    get show() {
      return show
    },
  })
  const { visible, data: transitionData } = $derived(_transition)

  // Ensure we close the listbox as soon as the button becomes hidden
  useOnDisappear({
    get enabled() {
      return visible
    },
    get ref() {
      return _state.buttonElement
    },
    get ondisappear() {
      return _state.closeMenu
    },
  })

  // Enable scroll locking when the listbox is visible, and `modal` is enabled
  const scrollLockEnabled = $derived(_state.__demoMode ? false : modal && _state.menuState === MenuStates.Open)
  useScrollLock({
    get enabled() {
      return scrollLockEnabled
    },
    get ownerDocument() {
      return ownerDocument
    },
  })

  // Mark other elements as inert when the listbox is visible, and `modal` is enabled
  const inertOthersEnabled = $derived(_state.__demoMode ? false : modal && _state.menuState === MenuStates.Open)
  useInertOthers({
    get enabled() {
      return inertOthersEnabled
    },
    elements: {
      get allowed() {
        return [_state.buttonElement, _state.itemsElement].filter(Boolean)
      },
    },
  })

  // We keep track whether the button moved or not, we only check this when the menu state becomes
  // closed. If the button moved, then we want to cancel pending transitions to prevent that the
  // attached `MenuItems` is still transitioning while the button moved away.
  //
  // If we don't cancel these transitions then there will be a period where the `MenuItems` is
  // visible and moving around because it is trying to re-position itself based on the new position.
  //
  // This can be solved by only transitioning the `opacity` instead of everything, but if you _do_
  // want to transition the y-axis for example you will run into the same issue again.
  const didElementMoveEnabled = $derived(_state.menuState !== MenuStates.Open)
  const didButtonMove = useDidElementMove({
    get enabled() {
      return didElementMoveEnabled
    },
    get element() {
      return _state.buttonElement
    },
  })

  // Now that we know that the button did move or not, we can either disable the panel and all of
  // its transitions, or rely on the `visible` state to hide the panel whenever necessary.
  const panelEnabled = $derived(didButtonMove.value ? false : visible)

  $effect(() => {
    let container = _state.itemsElement
    if (!container) return
    if (_state.menuState !== MenuStates.Open) return
    if (container === ownerDocument?.activeElement) return

    container.focus({ preventScroll: true })
  })

  useTreeWalker({
    get enabled() {
      return _state.menuState === MenuStates.Open
    },
    get container() {
      return _state.itemsElement
    },
    accept: (node) => {
      if (node.getAttribute("role") === "menuitem") return NodeFilter.FILTER_REJECT
      if (node.hasAttribute("role")) return NodeFilter.FILTER_SKIP
      return NodeFilter.FILTER_ACCEPT
    },
    walk: (node) => {
      node.setAttribute("role", "none")
    },
  })

  const searchDisposables = useDisposables()

  const handleKeyDown = async (event: KeyboardEvent) => {
    searchDisposables.dispose()

    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboard-interaction-12

      case " ":
        if (_state.searchQuery !== "") {
          event.preventDefault()
          event.stopPropagation()
          return _state.search(event.key)
        }
      // When in type ahead mode, fallthrough
      case "Enter":
        event.preventDefault()
        event.stopPropagation()
        _state.closeMenu()
        if (_state.activeItemIndex !== null) {
          let { dataRef } = _state.items[_state.activeItemIndex]
          dataRef.current?.domRef.current?.click()
        }
        restoreFocusIfNecessary(_state.buttonElement)
        break

      case "ArrowDown":
        event.preventDefault()
        event.stopPropagation()
        return _state.goToItem({ focus: Focus.Next })

      case "ArrowUp":
        event.preventDefault()
        event.stopPropagation()
        return _state.goToItem({ focus: Focus.Previous })

      case "Home":
      case "PageUp":
        event.preventDefault()
        event.stopPropagation()
        return _state.goToItem({ focus: Focus.First })

      case "End":
      case "PageDown":
        event.preventDefault()
        event.stopPropagation()
        return _state.goToItem({ focus: Focus.Last })

      case "Escape":
        event.preventDefault()
        event.stopPropagation()
        _state.closeMenu()
        await tick()
        _state.buttonElement?.focus({ preventScroll: true })
        break

      case "Tab":
        event.preventDefault()
        event.stopPropagation()
        _state.closeMenu()
        await tick()
        focusFrom(_state.buttonElement!, event.shiftKey ? FocusManagementFocus.Previous : FocusManagementFocus.Next)
        break

      default:
        if (event.key.length === 1) {
          _state.search(event.key)
          searchDisposables.setTimeout(() => _state.clearSearch(), 350)
        }
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

  const slot = $derived({
    open: _state.menuState === MenuStates.Open,
  } satisfies ItemsRenderPropArg)

  const buttonSize = useElementSize({
    get element() {
      return _state.buttonElement
    },
    unit: true,
  })

  const ourProps = $derived(
    mergeProps(anchor ? getFloatingPanelProps() : {}, {
      "aria-activedescendant": _state.activeItemIndex === null ? undefined : _state.items[_state.activeItemIndex]?.id,
      "aria-labelledby": _state.buttonElement?.id,
      id,
      onkeydown: handleKeyDown,
      onkeyup: handleKeyUp,
      role: "menu",
      // When the `Menu` is closed, it should not be focusable. This allows us
      // to skip focusing the `MenuItems` when pressing the tab key on an
      // open `Menu`, and go to the next focusable element.
      tabindex: _state.menuState === MenuStates.Open ? 0 : undefined,
      ref,
      style: [theirProps.style, style, `--button-width: ${buttonSize.width}`].filter(Boolean).join("; "),
      ...transitionDataAttributes(transitionData),
    })
  )
</script>

<Portal enabled={portal ? theirProps.static || visible : false}>
  <ElementOrComponent
    {ourProps}
    {theirProps}
    slots={slot}
    defaultTag={DEFAULT_ITEMS_TAG}
    features={ItemsRenderFeatures}
    visible={panelEnabled}
    name="MenuItems"
    bind:ref
  />
</Portal>
