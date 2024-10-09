<script lang="ts" module>
  import type { ElementType, Props } from "../utils/types.js"
  import { RenderFeatures } from "../utils/render.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  const DEFAULT_PANEL_TAG = "div" as const
  type PanelRenderPropArg = {
    open: boolean
    close: (focusableElement?: HTMLElement) => void
  }

  const PanelRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

  type PanelPropsWeControl = "tabIndex"

  export type PopoverPanelProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_PANEL_TAG],
    PanelRenderPropArg,
    PanelPropsWeControl,
    {
      focus?: boolean
      anchor?: AnchorProps
      portal?: boolean
      modal?: boolean
      transition?: boolean

      // ItemsRenderFeatures
      static?: boolean
      unmount?: boolean
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import { useId } from "../hooks/use-id.js"
  import ElementOrComponent from "../utils/ElementOrComponent.svelte"
  import { mergeProps } from "../utils/render.js"
  import {
    useFloatingPanel,
    useFloatingPanelProps,
    useResolvedAnchor,
    type AnchorProps,
  } from "../internal/floating.svelte.js"
  import {
    type PopoverAPIContext,
    type PopoverPanelContext,
    PopoverStates,
    usePopoverAPIContext,
    usePopoverContext,
  } from "./context.svelte.js"
  import { getOwnerDocument } from "../utils/owner.js"
  import { clearOpenClosedContext, State, useOpenClosed } from "../internal/open-closed.js"
  import { transitionDataAttributes, useTransition } from "../hooks/use-transition.svelte.js"
  import { useOnDisappear } from "../hooks/use-on-disappear.svelte.js"
  import { useScrollLock } from "../hooks/use-scroll-lock.svelte.js"
  import { Focus, focusIn, FocusResult, getFocusableElements } from "../utils/focus-management.js"
  import { useElementSize } from "../hooks/use-element-size.svelte.js"
  import { useTabDirection, Direction as TabDirection } from "../hooks/use-tab-direction.svelte.js"
  import { match } from "../utils/match.js"
  import { microTask } from "../utils/microTask.js"
  import { setContext, untrack } from "svelte"
  import Portal from "../portal/Portal.svelte"
  import Hidden, { HiddenFeatures } from "../internal/Hidden.svelte"

  let internalId = useId()
  let {
    element = $bindable(),
    id = `headlessui-popover-panel-${internalId}`,
    focus = false,
    anchor: rawAnchor,
    portal: theirPortal = false,
    modal = false,
    transition = false,
    ...theirProps
  }: PopoverPanelProps<TTag> = $props()

  const context = usePopoverContext("PopoverPanel")
  const api = usePopoverAPIContext("PopoverPanel")
  const { close, isPortalled } = $derived(api)

  const beforePanelSentinelId = `headlessui-focus-sentinel-before-${internalId}`
  const afterPanelSentinelId = `headlessui-focus-sentinel-after-${internalId}`

  const resolvedAnchor = useResolvedAnchor({
    get anchor() {
      return rawAnchor
    },
  })
  const { anchor } = $derived(resolvedAnchor)
  const floatingPanel = useFloatingPanel({
    get placement() {
      return anchor
    },
  })
  const { setFloating, styles } = $derived(floatingPanel)
  const getFloatingPanelProps = useFloatingPanelProps()

  // Always enable `portal` functionality, when `anchor` is enabled
  const portal = $derived(!!anchor || theirPortal)

  $effect(() => {
    if (anchor) setFloating(element ?? null)
    untrack(() => context.setPanel(element))
  })
  const ownerDocument = $derived(getOwnerDocument(element))

  $effect(() => {
    id
    return untrack(() => {
      context.setPanelId(id)
      return () => {
        context.setPanelId(undefined)
      }
    })
  })

  const usesOpenClosedState = useOpenClosed()
  const _transition = useTransition({
    get enabled() {
      return transition
    },
    get element() {
      return element
    },
    get show() {
      return usesOpenClosedState !== null
        ? (usesOpenClosedState.value & State.Open) === State.Open
        : context.popoverState === PopoverStates.Open
    },
  })
  const { visible, data: transitionData } = $derived(_transition)

  // Ensure we close the popover as soon as the button becomes hidden
  useOnDisappear({
    get enabled() {
      return visible
    },
    get ref() {
      return context.button
    },
    ondisappear: () => {
      context.closePopover()
    },
  })

  // Enable scroll locking when the popover is visible, and `modal` is enabled
  const scrollLockEnabled = $derived(context.__demoMode ? false : modal && visible)
  useScrollLock({
    get enabled() {
      return scrollLockEnabled
    },
    get ownerDocument() {
      return ownerDocument
    },
  })

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Escape":
        if (context.popoverState !== PopoverStates.Open) return
        if (!element) return
        if (ownerDocument?.activeElement && !element.contains(ownerDocument.activeElement)) {
          return
        }
        event.preventDefault()
        event.stopPropagation()
        context.closePopover()
        context.button?.focus()
        break
    }
  }

  // Unlink on "unmount" children
  $effect(() => {
    if (theirProps.static) return

    if (context.popoverState === PopoverStates.Closed && (theirProps.unmount ?? true)) {
      context.setPanel(undefined)
    }
  }) //, [state.popoverState, props.unmount, props.static, dispatch])

  // Move focus within panel
  $effect(() => {
    if (context.__demoMode) return
    if (!focus) return
    if (context.popoverState !== PopoverStates.Open) return
    if (!element) return

    const activeElement = ownerDocument?.activeElement as HTMLElement
    if (element.contains(activeElement)) return // Already focused within Dialog

    focusIn(element, Focus.First)
  }) //, [state.__demoMode, focus, internalPanelRef.current, state.popoverState])

  const slot = $derived({
    open: context.popoverState === PopoverStates.Open,
    close,
  } satisfies PanelRenderPropArg)

  const buttonSize = useElementSize({
    get element() {
      return context.button ?? null
    },
    unit: true,
  })
  const ourProps: Record<string, any> = $derived(
    mergeProps(anchor ? getFloatingPanelProps() : {}, {
      id,
      onkeydown: handleKeyDown,
      onblur:
        focus && context.popoverState === PopoverStates.Open
          ? (event: FocusEvent) => {
              let el = event.relatedTarget as HTMLElement
              if (!el) return
              if (!element) return
              if (element.contains(el)) return

              context.closePopover()

              if (context.beforePanelSentinel?.contains?.(el) || context.afterPanelSentinel?.contains?.(el)) {
                el.focus({ preventScroll: true })
              }
            }
          : undefined,
      tabIndex: -1,
      style: [theirProps.style, styles, `--button-width: ${buttonSize.width}`].filter(Boolean).join("; "),
      ...transitionDataAttributes(transitionData),
    })
  )

  const direction = useTabDirection()
  const handleBeforeFocus = () => {
    let el = element as HTMLElement
    if (!el) return

    function run() {
      match(direction.current, {
        [TabDirection.Forwards]: () => {
          // Try to focus the first thing in the panel. But if that fails (e.g.: there are no
          // focusable elements, then we can move outside of the panel)
          let result = focusIn(el, Focus.First)
          if (result === FocusResult.Error) {
            context.afterPanelSentinel?.focus()
          }
        },
        [TabDirection.Backwards]: () => {
          // Coming from the PopoverPanel (which is portalled to somewhere else). Let's redirect
          // the focus to the PopoverButton again.
          context.button?.focus({ preventScroll: true })
        },
      })
    }

    // TODO: Cleanup once we are using real browser tests
    if (process.env.NODE_ENV === "test") {
      microTask(run)
    } else {
      run()
    }
  }

  const handleAfterFocus = () => {
    let el = element as HTMLElement
    if (!el) return

    function run() {
      match(direction.current, {
        [TabDirection.Forwards]: () => {
          if (!context.button) return

          const elements = getFocusableElements()

          const idx = elements.indexOf(context.button)
          const before = elements.slice(0, idx + 1)
          const after = elements.slice(idx + 1)

          const combined = [...after, ...before]

          // Ignore sentinel buttons and items inside the panel
          for (const element of combined.slice()) {
            if (element.dataset.headlessuiFocusGuard === "true" || element?.contains(element)) {
              let idx = combined.indexOf(element)
              if (idx !== -1) combined.splice(idx, 1)
            }
          }

          focusIn(combined, Focus.First, { sorted: false })
        },
        [TabDirection.Backwards]: () => {
          // Try to focus the first thing in the panel. But if that fails (e.g.: there are no
          // focusable elements, then we can move outside of the panel)
          let result = focusIn(el, Focus.Previous)
          if (result === FocusResult.Error) {
            context.button?.focus()
          }
        },
      })
    }

    // TODO: Cleanup once we are using real browser tests
    if (process.env.NODE_ENV === "test") {
      microTask(run)
    } else {
      run()
    }
  }

  clearOpenClosedContext()
  setContext<PopoverPanelContext>("PopoverPanelContext", {
    get value() {
      return id
    },
  })
  setContext<PopoverAPIContext>("PopoverAPIContext", {
    get close() {
      return close
    },
    get isPortalled() {
      return isPortalled
    },
  })
</script>

<Portal enabled={portal ? theirProps.static || visible : false}>
  {#if visible && isPortalled}
    <Hidden
      id={beforePanelSentinelId}
      bind:element={context.beforePanelSentinel as HTMLElement}
      features={HiddenFeatures.Focusable}
      data-headlessui-focus-guard
      as="button"
      type="button"
      onfocus={handleBeforeFocus}
    />
  {/if}
  <ElementOrComponent
    {ourProps}
    {theirProps}
    slots={slot}
    defaultTag={DEFAULT_PANEL_TAG}
    features={PanelRenderFeatures}
    {visible}
    name="PopoverPanel"
    bind:element
  />
  {#if visible && isPortalled}
    <Hidden
      id={afterPanelSentinelId}
      bind:element={context.afterPanelSentinel as HTMLElement}
      features={HiddenFeatures.Focusable}
      data-headlessui-focus-guard
      as="button"
      type="button"
      onfocus={handleAfterFocus}
    />
  {/if}
</Portal>
