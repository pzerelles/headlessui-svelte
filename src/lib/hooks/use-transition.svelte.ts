import {
  hasChildren,
  useNesting,
  type NestingContextValues,
  type TransitionContextValues,
} from "$lib/transition/context.svelte.js"
import { disposables, useDisposables, type Disposables } from "$lib/utils/disposables.js"
import { once } from "$lib/utils/once.js"
import { setContext, untrack } from "svelte"

/**
 * ```
 * ┌──────┐                │        ┌──────────────┐
 * │Closed│                │        │Closed        │
 * └──────┘                │        └──────────────┘
 * ┌──────┐┌──────┐┌──────┐│┌──────┐┌──────┐┌──────┐
 * │Frame ││Frame ││Frame │││Frame ││Frame ││Frame │
 * └──────┘└──────┘└──────┘│└──────┘└──────┘└──────┘
 * ┌──────────────────────┐│┌──────────────────────┐
 * │Enter                 │││Leave                 │
 * └──────────────────────┘│└──────────────────────┘
 * ┌──────────────────────┐│┌──────────────────────┐
 * │Transition            │││Transition            │
 * ├──────────────────────┘│└──────────────────────┘
 * │
 * └─ Applied when `Enter` or `Leave` is applied.
 * ```
 */
enum TransitionState {
  None = 0,

  Closed = 1 << 0,

  Enter = 1 << 1,
  Leave = 1 << 2,
}

type TransitionData = {
  closed?: boolean
  enter?: boolean
  leave?: boolean
  transition?: boolean
}

export function transitionDataAttributes(data: TransitionData) {
  const attributes: Record<string, string> = {}
  for (const key in data) {
    if (data[key as keyof TransitionData] === true) {
      attributes[`data-${key}`] = ""
    }
  }
  return attributes
}

export function useTransition(options: {
  enabled: boolean
  element: HTMLElement | null | undefined
  show: boolean
  events?: {
    start?(show: boolean): void
    end?(show: boolean): void
  }
  asChild?: boolean
}): { readonly visible: boolean; readonly data: TransitionData } {
  const { enabled, element, show, events, asChild } = $derived(options)
  let visible = $state((() => show)())

  let flags = $state(
    (() => (enabled && visible ? TransitionState.Enter | TransitionState.Closed : TransitionState.None))()
  )
  let inFlight = $state(false)
  let cancelled = $state(false)

  const d = useDisposables()

  const nestingBag = useNesting({
    done: () => {
      if (show) return
      visible = false
    },
  })

  function retry(enabled: boolean, show: boolean, node: HTMLElement | null | undefined, d: Disposables) {
    if (!enabled) return

    if (show) {
      visible = true
    }

    if (!node) {
      // Retry if the DOM node isn't available yet
      if (show && !asChild) {
        flags |= TransitionState.Enter | TransitionState.Closed
        return d.nextFrame(() => retry(enabled, show, node, d))
      }
      return
    }

    events?.start?.(show)

    return transition(node, {
      inFlight,
      prepare() {
        if (cancelled) {
          // Cancelled a cancellation, we're back to the original state.
          cancelled = false
        } else {
          // If we were already in-flight, then we want to cancel the current
          // transition.
          cancelled = inFlight
        }

        inFlight = true

        if (cancelled) return

        if (show) {
          flags = TransitionState.Enter | TransitionState.Closed
        } else {
          flags = TransitionState.Leave | (flags & TransitionState.Closed)
        }
      },
      run() {
        if (cancelled) {
          // If we cancelled a transition, then the `show` state is going to
          // be inverted already, but that doesn't mean we have to go to that
          // new state.
          //
          // What we actually want is to revert to the "idle" state (the
          // stable state where an `Enter` transitions to, and a `Leave`
          // transitions from.)
          //
          // Because of this, it might look like we are swapping the flags in
          // the following branches, but that's not the case.
          if (!show) {
            flags = TransitionState.Leave | TransitionState.Closed
          } else {
            flags = TransitionState.Enter | TransitionState.Closed
          }
        } else {
          if (show) {
            flags = flags & ~TransitionState.Closed
          } else {
            flags |= TransitionState.Closed
          }
        }
      },
      done() {
        if (cancelled) {
          if (typeof node.getAnimations === "function" && node.getAnimations().length > 0) {
            return
          }
        }

        inFlight = false

        // keep closed state if show is false for data-closed to work correctly
        flags = show ? 0 : TransitionState.Closed

        if (!show && !hasChildren(nestingBag)) {
          visible = false
        }

        events?.end?.(show)
      },
    })
  }

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    ;[enabled, show, element, d]
    return untrack(() => retry(enabled, show, element, d))
  })

  const data = $derived({
    closed: enabled ? !!(flags & TransitionState.Closed) : undefined,
    enter: enabled ? !!(flags & TransitionState.Enter) : undefined,
    leave: enabled ? !!(flags & TransitionState.Leave) : undefined,
    transition: enabled ? !!(flags & (TransitionState.Enter | TransitionState.Leave)) : undefined,
  })

  ;(() => {
    if (enabled) {
      setContext<NestingContextValues>("NestingContext", nestingBag)
      setContext<TransitionContextValues>("TransitionContext", {
        get show() {
          return show
        },
        get appear() {
          return false
        },
        get initial() {
          return false
        },
      })
    }
  })()

  return {
    get visible() {
      return enabled ? visible : show
    },
    get data() {
      return data
    },
  }
}

function transition(
  node: HTMLElement,
  {
    prepare,
    run,
    done,
    inFlight,
  }: {
    prepare: () => void
    run: () => void
    done: () => void
    inFlight: boolean
  }
) {
  const d = disposables()

  // Prepare the transitions by ensuring that all the "before" classes are
  // applied and flushed to the DOM.
  prepareTransition(node, {
    prepare,
    inFlight,
  })

  // This is a workaround for a bug in all major browsers.
  //
  // 1. When an element is just mounted
  // 2. And you apply a transition to it (e.g.: via a class)
  // 3. And you're using `getComputedStyle` and read any returned value
  // 4. Then the `transition` immediately jumps to the end state
  //
  // This means that no transition happens at all. To fix this, we delay the
  // actual transition by one frame.
  d.nextFrame(() => {
    // Wait for the transition, once the transition is complete we can cleanup.
    // This is registered first to prevent race conditions, otherwise it could
    // happen that the transition is already done before we start waiting for
    // the actual event.
    d.add(waitForTransition(node, done))

    // Initiate the transition by applying the new classes.
    run()
  })

  return d.dispose
}

function waitForTransition(node: HTMLElement, _done: () => void) {
  const done = once(_done)
  const d = disposables()

  if (!node) return d.dispose

  // Safari returns a comma separated list of values, so let's sort them and take the highest value.
  const { transitionDuration, transitionDelay } = getComputedStyle(node)

  const [durationMs, delayMs] = [transitionDuration, transitionDelay].map((value) => {
    const [resolvedValue = 0] = value
      .split(",")
      // Remove falsy we can't work with
      .filter(Boolean)
      // Values are returned as `0.3s` or `75ms`
      .map((v) => (v.includes("ms") ? parseFloat(v) : parseFloat(v) * 1000))
      .sort((a, z) => z - a)

    return resolvedValue
  })

  const totalDuration = durationMs + delayMs

  if (totalDuration !== 0) {
    if (process.env.NODE_ENV === "test") {
      const dispose = d.setTimeout(() => {
        done()
        dispose()
      }, totalDuration)
    } else {
      const disposeGroup = d.group((d) => {
        // Mark the transition as done when the timeout is reached. This is a fallback in case the
        // transitionrun event is not fired.
        const cancelTimeout = d.setTimeout(() => {
          done()
          d.dispose()
        }, totalDuration)

        // The moment the transitionrun event fires, we should cleanup the timeout fallback, because
        // then we know that we can use the native transition events because something is
        // transitioning.
        d.addEventListener(node, "transitionrun", (event) => {
          if (event.target !== event.currentTarget) return
          cancelTimeout()

          d.addEventListener(node, "transitioncancel", (event) => {
            if (event.target !== event.currentTarget) return
            done()
            disposeGroup()
          })
        })
      })

      d.addEventListener(node, "transitionend", (event) => {
        if (event.target !== event.currentTarget) return
        done()
        d.dispose()
      })
    }
  } else {
    // No transition is happening, so we should cleanup already. Otherwise we have to wait until we
    // get disposed.
    done()
  }

  return d.dispose
}

function prepareTransition(node: HTMLElement, { inFlight, prepare }: { inFlight?: boolean; prepare: () => void }) {
  // If we are already transitioning, then we don't need to force cancel the
  // current transition (by triggering a reflow).
  if (inFlight) {
    prepare()
    return
  }

  const previous = node.style.transition

  // Force cancel current transition
  node.style.transition = "none"

  prepare()

  // Trigger a reflow, flushing the CSS changes
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  node.offsetHeight

  // Reset the transition to what it was before
  node.style.transition = previous
}
