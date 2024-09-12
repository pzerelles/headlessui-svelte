<script lang="ts" module>
  import { useOutsideClick } from "$lib/hooks/use-outside-click.svelte.js"
  import { useFloatingProvider } from "$lib/internal/floating.svelte.js"
  import { createOpenClosedContext, State } from "$lib/internal/open-closed.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { FocusableMode, isFocusableElement } from "$lib/utils/focus-management.js"
  import { match } from "$lib/utils/match.js"
  import type { ElementType, Props } from "$lib/utils/types.js"
  import type { Snippet } from "svelte"

  let DEFAULT_MENU_TAG = "svelte:fragment"
  type MenuRenderPropArg = {
    open: boolean
    close: () => void
  }
  type MenuPropsWeControl = never

  export type MenuProps<TTag extends ElementType = typeof DEFAULT_MENU_TAG> = Props<
    TTag,
    MenuRenderPropArg,
    MenuPropsWeControl,
    {
      __demoMode?: boolean
    }
  >

  export type MenuChildren<T> = Snippet<[MenuRenderPropArg]>
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_MENU_TAG">
  import { setContext } from "svelte"
  import {
    ActivationTrigger,
    MenuStates,
    stateReducer,
    type MenuContext,
    type StateDefinition,
  } from "./context.svelte.js"

  let { ref = $bindable(), __demoMode = false, ...theirProps }: { as?: TTag } & MenuProps<TTag> = $props()

  const _state = stateReducer({
    __demoMode,
    menuState: __demoMode ? MenuStates.Open : MenuStates.Closed,
    buttonElement: null,
    itemsElement: null,
    items: [],
    searchQuery: "",
    activeItemIndex: null,
    activationTrigger: ActivationTrigger.Other,
  } as StateDefinition)
  const { menuState, itemsElement, buttonElement } = $derived(_state)
  setContext<MenuContext>("MenuContext", _state)

  // Handle outside click
  const outsideClickEnabled = $derived(menuState === MenuStates.Open)
  useOutsideClick({
    get enabled() {
      return outsideClickEnabled
    },
    get containers() {
      return [buttonElement, itemsElement]
    },
    cb: (event, target) => {
      _state.closeMenu()

      if (!isFocusableElement(target, FocusableMode.Loose)) {
        event.preventDefault()
        buttonElement?.focus()
      }
    },
  })

  const slot = $derived({
    open: _state.menuState === MenuStates.Open,
    close: _state.closeMenu,
  } satisfies MenuRenderPropArg)

  useFloatingProvider()

  const openClosed = $derived(
    match(menuState, {
      [MenuStates.Open]: State.Open,
      [MenuStates.Closed]: State.Closed,
    })
  )
  createOpenClosedContext({
    get value() {
      return openClosed
    },
  })
</script>

<ElementOrComponent {theirProps} {slot} defaultTag={DEFAULT_MENU_TAG} name="Menu" bind:ref />
