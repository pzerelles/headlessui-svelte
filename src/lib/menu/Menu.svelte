<script lang="ts" module>
  import type { PropsAsChild } from "$lib/utils/types.js"

  let DEFAULT_MENU_TAG = "svelte:fragment"
  export type MenuRenderPropArg = {
    open: boolean
    close: () => void
  }
  type MenuPropsWeControl = never

  export type MenuProps = PropsAsChild<
    MenuRenderPropArg,
    {
      __demoMode?: boolean
    }
  >
</script>

<script lang="ts">
  import { ActivationTrigger, createMenuContext, MenuStates, type StateDefinition } from "./context.svelte.js"
  import { useOutsideClick } from "$lib/hooks/use-outside-click.svelte.js"
  import { useFloatingProvider } from "$lib/internal/floating-provider.svelte.js"
  import { createOpenClosedContext, State } from "$lib/internal/open-closed.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { FocusableMode, isFocusableElement } from "$lib/utils/focus-management.js"
  import { match } from "$lib/utils/match.js"

  let { __demoMode = false, ...theirProps }: MenuProps = $props()

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

<ElementOrComponent {theirProps} {slot} name="Menu" />
