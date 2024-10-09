<script lang="ts" module>
  import type { ElementType, Props } from "../utils/types.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  let DEFAULT_MENU_TAG = "svelte:fragment"
  type MenuRenderPropArg = {
    open: boolean
    close: () => void
  }
  type MenuPropsWeControl = never

  export type MenuProps<TTag extends ElementType = undefined> = Props<
    TTag,
    {},
    MenuRenderPropArg,
    MenuPropsWeControl,
    {
      __demoMode?: boolean
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import { ActivationTrigger, createMenuContext, MenuStates, type StateDefinition } from "./context.svelte.js"
  import { useOutsideClick } from "../hooks/use-outside-click.svelte.js"
  import { useFloatingProvider } from "../internal/floating-provider.svelte.js"
  import { createOpenClosedContext, State } from "../internal/open-closed.js"
  import ElementOrComponent from "../utils/ElementOrComponent.svelte"
  import { FocusableMode, isFocusableElement } from "../utils/focus-management.js"
  import { match } from "../utils/match.js"

  let { element = $bindable(), __demoMode = false, ...theirProps }: MenuProps<TTag> = $props()

  const context = createMenuContext({
    __demoMode,
    menuState: __demoMode ? MenuStates.Open : MenuStates.Closed,
    buttonElement: null,
    itemsElement: null,
    items: [],
    searchQuery: "",
    activeItemIndex: null,
    activationTrigger: ActivationTrigger.Other,
  } as StateDefinition)
  const { menuState, itemsElement, buttonElement } = $derived(context)

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
      context.closeMenu()

      if (!isFocusableElement(target, FocusableMode.Loose)) {
        event.preventDefault()
        buttonElement?.focus()
      }
    },
  })

  const slot = $derived({
    open: context.menuState === MenuStates.Open,
    close: context.closeMenu,
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

<ElementOrComponent {theirProps} {slot} defaultTag={DEFAULT_MENU_TAG} name="Menu" bind:element />
