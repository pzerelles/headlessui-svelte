<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  export const DEFAULT_POPOVER_TAG = "div" as const
  export type PopoverRenderPropArg = {
    open: boolean
    close(focusableElement?: HTMLElement | MouseEvent<HTMLElement>): void
  }
  type PopoverPropsWeControl = never

  export type PopoverOwnProps = {
    element?: HTMLElement
    __demoMode?: boolean
  }

  export type PopoverProps = Props<typeof DEFAULT_POPOVER_TAG, PopoverRenderPropArg, PopoverOwnProps>
</script>

<script lang="ts">
  import { getOwnerDocument } from "$lib/utils/owner.js"

  import { setContext, untrack } from "svelte"
  import {
    createPopoverContext,
    PopoverStates,
    usePopoverGroupContext,
    type MouseEvent,
    type PopoverAPIContext,
    type PopoverPanelContext,
  } from "./context.svelte.js"
  import { FocusableMode, getFocusableElements, isFocusableElement } from "$lib/utils/focus-management.js"
  import { useNestedPortals } from "$lib/portal/InternalPortal.svelte"
  import MainTreeProvider, { useMainTreeNode } from "$lib/internal/MainTreeProvider.svelte"
  import { useRootContainers } from "$lib/hooks/use-root-containers.svelte.js"
  import { useEventListener } from "$lib/hooks/use-event-listener.svelte.js"
  import { useOutsideClick } from "$lib/hooks/use-outside-click.svelte.js"
  import { useFloatingProvider } from "$lib/internal/floating-provider.svelte.js"
  import { createCloseContext } from "$lib/internal/close-provider.js"
  import { createOpenClosedContext, State } from "$lib/internal/open-closed.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  let { element = $bindable(), __demoMode = false, ...theirProps }: PopoverProps = $props()

  let buttons = $state([])
  const context = createPopoverContext({
    __demoMode,
    popoverState: __demoMode ? PopoverStates.Open : PopoverStates.Closed,
    buttons,
  })
  const {
    popoverState,
    button,
    buttonId,
    panel,
    panelId,
    beforePanelSentinel,
    afterPanelSentinel,
    afterButtonSentinel,
  } = $derived(context)

  const ownerDocument = $derived(getOwnerDocument(element ?? button))

  const isPortalled = $derived.by(() => {
    if (!button) return false
    if (!panel) return false

    return untrack(() => {
      // We are part of a different "root" tree, so therefore we can consider it portalled. This is a
      // heuristic because 3rd party tools could use some form of portal, typically rendered at the
      // end of the body but we don't have an actual reference to that.
      for (let root of document.querySelectorAll("body > *")) {
        if (Number(root?.contains(button)) ^ Number(root?.contains(panel))) {
          return true
        }
      }

      // Use another heuristic to try and calculate whether or not the focusable
      // elements are near each other (aka, following the default focus/tab order
      // from the browser). If they are then it doesn't really matter if they are
      // portalled or not because we can follow the default tab order. But if they
      // are not, then we can consider it being portalled so that we can ensure
      // that tab and shift+tab (hopefully) go to the correct spot.
      let elements = getFocusableElements()
      let buttonIdx = elements.indexOf(button)

      let beforeIdx = (buttonIdx + elements.length - 1) % elements.length
      let afterIdx = (buttonIdx + 1) % elements.length

      let beforeElement = elements[beforeIdx]
      let afterElement = elements[afterIdx]

      if (!panel.contains(beforeElement) && !panel.contains(afterElement)) {
        return true
      }

      // It may or may not be portalled, but we don't really know.
      return false
    })
  })

  const registerBag = $derived({
    buttonId,
    panelId,
    close: () => context.closePopover(),
  })

  const groupContext = usePopoverGroupContext()
  const registerPopover = $derived(groupContext?.registerPopover)
  const isFocusWithinPopoverGroup = () => {
    return (
      groupContext?.isFocusWithinPopoverGroup() ??
      (ownerDocument?.activeElement &&
        (button?.contains(ownerDocument.activeElement) || panel?.contains(ownerDocument.activeElement)))
    )
  }

  $effect(() => {
    registerBag
    untrack(() => registerPopover?.(registerBag))
  })

  const nestedPortals = useNestedPortals()
  const { portals } = $derived(nestedPortals)
  const mainTreeNode = useMainTreeNode({
    get fallbackMainTreeNode() {
      return button
    },
  })
  const root = useRootContainers({
    get mainTreeNode() {
      return mainTreeNode.node
    },
    get portals() {
      return portals
    },
    get defaultContainers() {
      return [button, panel]
    },
  })

  // Handle focus out
  useEventListener({
    get element() {
      return ownerDocument?.defaultView
    },
    type: "focus",
    listener: (event) => {
      if (event.target === window) return
      if (!(event.target instanceof HTMLElement)) return
      if (popoverState !== PopoverStates.Open) return
      if (isFocusWithinPopoverGroup()) return
      if (!button) return
      if (!panel) return
      if (root.contains(event.target)) return
      if (beforePanelSentinel?.contains?.(event.target)) return
      if (afterPanelSentinel?.contains?.(event.target)) return
      if (afterButtonSentinel?.contains?.(event.target)) return

      context.closePopover()
    },
    options: true,
  })

  // Handle outside click
  const outsideClickEnabled = $derived(popoverState === PopoverStates.Open)
  useOutsideClick({
    get enabled() {
      return outsideClickEnabled
    },
    get containers() {
      return root.resolvedContainers
    },
    cb: (event, target) => {
      context.closePopover()

      if (!isFocusableElement(target, FocusableMode.Loose)) {
        event.preventDefault()
        button?.focus()
      }
    },
  })

  const close = (focusableElement?: HTMLElement | MouseEvent<HTMLElement>) => {
    context.closePopover()

    const restoreElement = (() => {
      if (!focusableElement) return button
      if (focusableElement instanceof HTMLElement) return focusableElement

      return button
    })()

    restoreElement?.focus()
  }

  const api: PopoverAPIContext = {
    close,
    get isPortalled() {
      return isPortalled
    },
  }
  setContext("PopoverAPIContext", api)

  const slot = $derived({
    open: popoverState === PopoverStates.Open,
    close,
  } satisfies PopoverRenderPropArg)

  useFloatingProvider()

  setContext<PopoverPanelContext | undefined>("PopoverPanelContext", undefined)

  createCloseContext({
    get close() {
      return close
    },
  })

  createOpenClosedContext({
    get value() {
      return context.popoverState === PopoverStates.Open ? State.Open : State.Closed
    },
  })
</script>

<MainTreeProvider node={mainTreeNode.node}>
  <ElementOrComponent {theirProps} slots={slot} defaultTag={DEFAULT_POPOVER_TAG} name="Popover" bind:element />
</MainTreeProvider>
