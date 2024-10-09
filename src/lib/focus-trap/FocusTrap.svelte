<script lang="ts" module>
  import { getOwnerDocument } from "$lib/utils/owner.js"
  import type { ElementType, Props } from "$lib/utils/types.js"
  import { history } from "$lib/utils/active-element-history.js"
  import { useWatch } from "$lib/hooks/use-watch.svelte.js"
  import { microTask } from "$lib/utils/microTask.js"
  import { Focus, focusElement, focusIn, FocusResult } from "$lib/utils/focus-management.js"
  import { useIsTopLayer } from "$lib/hooks/use-is-top-layer.svelte.js"
  import { useIsMounted } from "$lib/hooks/use-is-mounted.svelte.js"
  import { useEventListener } from "$lib/hooks/use-event-listener.svelte.js"
  import { useTabDirection, Direction as TabDirection } from "$lib/hooks/use-tab-direction.svelte.js"
  import { match } from "$lib/utils/match.js"
  import { useDisposables } from "$lib/utils/disposables.js"
  import Hidden, { HiddenFeatures } from "$lib/internal/Hidden.svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { FocusTrapFeatures } from "./FocusTrapFeatures.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  type Containers =
    // Lazy resolved containers
    | (() => Iterable<HTMLElement>)

    // List of containers
    | Iterable<HTMLElement>

  function resolveContainers(containers?: Containers): Set<HTMLElement> {
    if (!containers) return new Set<HTMLElement>()
    if (typeof containers === "function") return new Set(containers())

    let all = new Set<HTMLElement>()
    for (let container of containers) {
      if (container instanceof HTMLElement) {
        all.add(container)
      }
    }
    return all
  }

  const DEFAULT_FOCUS_TRAP_TAG = "div" as const

  export * from "./FocusTrapFeatures.js"

  type FocusTrapRenderPropArg = {}
  type FocusTrapPropsWeControl = never

  export type FocusTrapProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_FOCUS_TRAP_TAG],
    FocusTrapRenderPropArg,
    FocusTrapPropsWeControl,
    {
      initialFocus?: HTMLElement
      // A fallback element to focus, but this element will be skipped when tabbing around. This is
      // only done for focusing a fallback parent container (e.g.: A `Dialog`, but you want to tab
      // *inside* the dialog excluding the dialog itself).
      initialFocusFallback?: HTMLElement
      features?: FocusTrapFeatures
      containers?: Containers
    }
  >

  function useRestoreElement(options?: { enabled: boolean }) {
    const { enabled } = $derived(options ?? { enabled: true })
    let localHistory = $state<HTMLElement[]>(history.slice())

    useWatch({
      action: ([newEnabled], [oldEnabled]) => {
        // We are disabling the restore element, so we need to clear it.
        if (oldEnabled === true && newEnabled === false) {
          // However, let's schedule it in a microTask, so that we can still read the value in the
          // places where we are restoring the focus.
          microTask(() => {
            localHistory.splice(0)
          })
        }

        // We are enabling the restore element, so we need to set it to the last "focused" element.
        if (oldEnabled === false && newEnabled === true) {
          localHistory = history.slice()
        }
      },
      get dependencies() {
        return [enabled, history, localHistory]
      },
    })

    // We want to return the last element that is still connected to the DOM, so we can restore the
    // focus to it.
    return {
      get lastElement() {
        return localHistory.find((x) => x != null && x.isConnected) ?? null
      },
    }
  }

  function useRestoreFocus(options: { features: FocusTrapFeatures; ownerDocument: Document | null }) {
    const { features, ownerDocument } = $derived(options)
    const enabled = $derived(Boolean(features & FocusTrapFeatures.RestoreFocus))

    const restoreElement = useRestoreElement({
      get enabled() {
        return enabled
      },
    })

    // Restore the focus to the previous element when `enabled` becomes false again
    useWatch({
      action: () => {
        if (enabled) return

        if (ownerDocument?.activeElement === ownerDocument?.body) {
          focusElement(restoreElement.lastElement)
        }
      },
      get dependencies() {
        return [enabled]
      },
    })

    // Restore the focus to the previous element when the component is unmounted
    $effect(() => {
      if (!enabled) return

      return () => focusElement(restoreElement.lastElement)
    })
  }

  function useInitialFocus(options: {
    features: FocusTrapFeatures
    ownerDocument: Document | null
    container: HTMLElement | null
    initialFocus?: HTMLElement | null
    initialFocusFallback?: HTMLElement | null
  }) {
    const { features, ownerDocument, container, initialFocus, initialFocusFallback } = $derived(options)
    let previousActiveElement = $state<HTMLElement | null>(null)
    let enabled = useIsTopLayer({
      get enabled() {
        return Boolean(features & FocusTrapFeatures.InitialFocus)
      },
      scope: "focus-trap#initial-focus",
    })

    let mounted = useIsMounted()

    // Handle initial focus
    useWatch({
      action: () => {
        // No focus management needed
        if (features === FocusTrapFeatures.None) {
          return
        }

        if (!enabled) {
          // If we are disabling the initialFocus, then we should focus the fallback element if one is
          // provided. This is needed to ensure _something_ is focused. Typically a wrapping element
          // (e.g.: `Dialog` component).
          //
          // Note: we _don't_ want to move focus to the `initialFocus` ref, because the `InitialFocus`
          // feature is disabled.
          if (initialFocusFallback) {
            focusElement(initialFocusFallback)
          }

          return
        }
        let containerElement = container
        if (!containerElement) return

        // Delaying the focus to the next microtask ensures that a few conditions are true:
        // - The container is rendered
        // - Transitions could be started
        // If we don't do this, then focusing an element will immediately cancel any transitions. This
        // is not ideal because transitions will look broken.
        // There is an additional issue with doing this immediately. The FocusTrap is used inside a
        // Dialog, the Dialog is rendered inside of a Portal and the Portal is rendered at the end of
        // the `document.body`. This means that the moment we call focus, the browser immediately
        // tries to focus the element, which will still be at the bottom resulting in the page to
        // scroll down. Delaying this will prevent the page to scroll down entirely.
        microTask(() => {
          if (!mounted.current) {
            return
          }

          let activeElement = ownerDocument?.activeElement as HTMLElement

          if (initialFocus) {
            if (initialFocus === activeElement) {
              previousActiveElement = activeElement
              return // Initial focus ref is already the active element
            }
          } else if (containerElement!.contains(activeElement)) {
            previousActiveElement = activeElement
            return // Already focused within Dialog
          }

          // Try to focus the initialFocus ref
          if (initialFocus) {
            focusElement(initialFocus)
          } else {
            if (features & FocusTrapFeatures.AutoFocus) {
              // Try to focus the first focusable element with `Focus.AutoFocus` feature enabled
              if (focusIn(containerElement!, Focus.First | Focus.AutoFocus) !== FocusResult.Error) {
                return // Worked, bail
              }
            }

            // Try to focus the first focusable element.
            else if (focusIn(containerElement!, Focus.First) !== FocusResult.Error) {
              return // Worked, bail
            }

            // Try the fallback
            if (initialFocusFallback) {
              focusElement(initialFocusFallback)
              if (ownerDocument?.activeElement === initialFocusFallback) {
                return // Worked, bail
              }
            }

            // Nothing worked
            console.warn("There are no focusable elements inside the <FocusTrap />")
          }

          previousActiveElement = ownerDocument?.activeElement as HTMLElement
        })
      },
      get dependencies() {
        return [initialFocusFallback, enabled, features]
      },
    })

    return {
      get value() {
        return previousActiveElement
      },
      set value(element) {
        previousActiveElement = element
      },
    }
  }

  function useFocusLock(options: {
    features: FocusTrapFeatures
    ownerDocument: Document | null
    container: HTMLElement | null
    containers?: Containers
    previousActiveElement: HTMLElement | null
  }) {
    let { features, ownerDocument, container, containers, previousActiveElement } = $derived(options)
    const mounted = useIsMounted()
    const enabled = $derived(Boolean(features & FocusTrapFeatures.FocusLock))

    // Prevent programmatically escaping the container
    useEventListener({
      get element() {
        return ownerDocument?.defaultView
      },
      type: "focus",
      listener: (event) => {
        if (!enabled) return
        if (!mounted.current) return

        let allContainers = resolveContainers(containers)
        if (container instanceof HTMLElement) allContainers.add(container)

        let previous = previousActiveElement
        if (!previous) return

        let toElement = event.target as HTMLElement | null

        if (toElement && toElement instanceof HTMLElement) {
          if (!contains(allContainers, toElement)) {
            event.preventDefault()
            event.stopPropagation()
            focusElement(previous)
          } else {
            options.previousActiveElement = toElement
            focusElement(toElement)
          }
        } else {
          focusElement(previousActiveElement)
        }
      },
      options: true,
    })
  }

  function contains(containers: Set<HTMLElement>, element: HTMLElement) {
    for (let container of containers) {
      if (container.contains(element)) return true
    }

    return false
  }
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  let container = $state<HTMLElement | null>(null)
  let {
    element = $bindable(),
    initialFocus,
    initialFocusFallback,
    containers,
    features = FocusTrapFeatures.InitialFocus |
      FocusTrapFeatures.TabLock |
      FocusTrapFeatures.FocusLock |
      FocusTrapFeatures.RestoreFocus,
    ...theirProps
  }: FocusTrapProps<TTag> = $props()

  /*if (!useServerHandoffComplete()) {
    features = FocusTrapFeatures.None
  }*/

  const ownerDocument = $derived(getOwnerDocument(element))

  useRestoreFocus({
    get features() {
      return features
    },
    get ownerDocument() {
      return ownerDocument
    },
  })
  let previousActiveElement = useInitialFocus({
    get features() {
      return features
    },
    get ownerDocument() {
      return ownerDocument
    },
    get container() {
      return container
    },
    get initialFocus() {
      return initialFocus
    },
    get initialFocusFallback() {
      return initialFocusFallback
    },
  })

  useFocusLock({
    get features() {
      return features
    },
    get ownerDocument() {
      return ownerDocument
    },
    get container() {
      return container
    },
    get containers() {
      return containers
    },
    get previousActiveElement() {
      return previousActiveElement.value
    },
    set previousActiveElement(element) {
      previousActiveElement.value = element
    },
  })

  const direction = useTabDirection()
  const handleFocus = (e: FocusEvent) => {
    let el = container as HTMLElement
    if (!el) return

    // TODO: Cleanup once we are using real browser tests
    let wrapper = process.env.NODE_ENV === "test" ? microTask : (cb: Function) => cb()
    wrapper(() => {
      match(direction.current, {
        [TabDirection.Forwards]: () => {
          focusIn(el, Focus.First, {
            skipElements: [e.relatedTarget, initialFocusFallback] as HTMLElement[],
          })
        },
        [TabDirection.Backwards]: () => {
          focusIn(el, Focus.Last, {
            skipElements: [e.relatedTarget, initialFocusFallback] as HTMLElement[],
          })
        },
      })
    })
  }

  let tabLockEnabled = useIsTopLayer({
    get enabled() {
      return Boolean(features & FocusTrapFeatures.TabLock)
    },
    scope: "focus-trap#tab-lock",
  })

  const d = useDisposables()
  let recentlyUsedTabKey = $state(false)
  const ourProps = $derived({
    onkeydown(e: KeyboardEvent) {
      if (e.key == "Tab") {
        recentlyUsedTabKey = true
        d.requestAnimationFrame(() => {
          recentlyUsedTabKey = false
        })
      }
    },
    onblur(e: FocusEvent) {
      if (!(features & FocusTrapFeatures.FocusLock)) return

      let allContainers = resolveContainers(containers)
      if (container instanceof HTMLElement) allContainers.add(container)

      let relatedTarget = e.relatedTarget
      if (!(relatedTarget instanceof HTMLElement)) return

      // Known guards, leave them alone!
      if (relatedTarget.dataset.headlessuiFocusGuard === "true") {
        return
      }

      // Blur is triggered due to focus on relatedTarget, and the relatedTarget is not inside any
      // of the dialog containers. In other words, let's move focus back in!
      if (!contains(allContainers, relatedTarget)) {
        // Was the blur invoked via the keyboard? Redirect to the next in line.
        if (recentlyUsedTabKey) {
          focusIn(
            container as HTMLElement,
            match(direction.current, {
              [TabDirection.Forwards]: () => Focus.Next,
              [TabDirection.Backwards]: () => Focus.Previous,
            }) | Focus.WrapAround,
            { relativeTo: e.target as HTMLElement }
          )
        }

        // It was invoked via something else (e.g.: click, programmatically, ...). Redirect to the
        // previous active item in the FocusTrap
        else if (e.target instanceof HTMLElement) {
          focusElement(e.target)
        }
      }
    },
  })
</script>

{#if tabLockEnabled}
  <Hidden
    as="button"
    type="button"
    data-headlessui-focus-guard
    onfocus={handleFocus}
    features={HiddenFeatures.Focusable}
  />
{/if}
<ElementOrComponent {ourProps} {theirProps} defaultTag={DEFAULT_FOCUS_TRAP_TAG} name="FocusTrap" bind:element />
{#if tabLockEnabled}
  <Hidden
    as="button"
    type="button"
    data-headlessui-focus-guard
    onfocus={handleFocus}
    features={HiddenFeatures.Focusable}
  />
{/if}
