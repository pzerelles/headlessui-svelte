import { getUserAgent } from "./utils.js"
import { evaluate, max, min, round } from "@floating-ui/utils"
import { detectOverflow, offset, type Derivable } from "../svelte-dom/index.js"

import type {
  DetectOverflowOptions,
  ElementProps,
  FloatingRootContext,
  Middleware,
  MiddlewareState,
  SideObject,
} from "./types.js"
import { warn } from "./utils/log.js"
import type { MutableRefObject } from "$lib/utils/ref.svelte.js"
import { DEV } from "esm-env"
import { tick, untrack } from "svelte"

function getArgsWithCustomFloatingHeight(state: MiddlewareState, height: number) {
  return {
    ...state,
    rects: {
      ...state.rects,
      floating: {
        ...state.rects.floating,
        height,
      },
    },
  }
}

export interface InnerProps extends DetectOverflowOptions {
  /**
   * A ref which contains an array of HTML elements.
   * @default empty list
   */
  listRef: MutableRefObject<Array<HTMLElement | null>>
  /**
   * The index of the active (focused or highlighted) item in the list.
   * @default 0
   */
  index: number
  /**
   * Callback invoked when the fallback state changes.
   */
  onFallbackChange?: null | ((fallback: boolean) => void)
  /**
   * The offset to apply to the floating element.
   * @default 0
   */
  offset?: number
  /**
   * A ref which contains the overflow of the floating element.
   */
  overflowRef?: MutableRefObject<SideObject | null>
  /**
   * An optional ref containing an HTMLElement. This may be used as the
   * scrolling container instead of the floating element — for instance,
   * to position inner elements as direct children without being interfered by
   * scrolling layout.
   */
  scrollRef?: MutableRefObject<HTMLElement | null>
  /**
   * The minimum number of items that should be visible in the list.
   * @default 4
   */
  minItemsVisible?: number
  /**
   * The threshold for the reference element's overflow in pixels.
   * @default 0
   */
  referenceOverflowThreshold?: number
}

/**
 * Positions the floating element such that an inner element inside of it is
 * anchored to the reference element.
 * @see https://floating-ui.com/docs/inner
 */
export const inner = (props: InnerProps | Derivable<InnerProps>): Middleware => ({
  name: "inner",
  options: props,
  async fn(state) {
    const {
      listRef,
      overflowRef,
      onFallbackChange,
      offset: innerOffset = 0,
      index = 0,
      minItemsVisible = 4,
      referenceOverflowThreshold = 0,
      scrollRef,
      ...detectOverflowOptions
    } = evaluate(props, state)

    const {
      rects,
      elements: { floating },
    } = state

    const item = listRef.current[index]
    const scrollEl = scrollRef?.current || floating

    // Valid combinations:
    // 1. Floating element is the scrollRef and has a border (default)
    // 2. Floating element is not the scrollRef, floating element has a border
    // 3. Floating element is not the scrollRef, scrollRef has a border
    // Floating > {...getFloatingProps()} wrapper > scrollRef > items is not
    // allowed as VoiceOver doesn't work.
    const clientTop = floating.clientTop || scrollEl.clientTop
    const floatingIsBordered = floating.clientTop !== 0
    const scrollElIsBordered = scrollEl.clientTop !== 0
    const floatingIsScrollEl = floating === scrollEl

    if (DEV) {
      if (!state.placement.startsWith("bottom")) {
        warn('`placement` side must be "bottom" when using the `inner`', "middleware.")
      }
    }

    if (!item) {
      return {}
    }

    const nextArgs = {
      ...state,
      ...(await offset(
        -item.offsetTop - floating.clientTop - rects.reference.height / 2 - item.offsetHeight / 2 - innerOffset
      ).fn(state)),
    }

    const overflow = await detectOverflow(
      getArgsWithCustomFloatingHeight(nextArgs, scrollEl.scrollHeight + clientTop + floating.clientTop),
      detectOverflowOptions
    )
    const refOverflow = await detectOverflow(nextArgs, {
      ...detectOverflowOptions,
      elementContext: "reference",
    })

    const diffY = max(0, overflow.top)
    const nextY = nextArgs.y + diffY

    const maxHeight = round(
      max(
        0,
        scrollEl.scrollHeight +
          ((floatingIsBordered && floatingIsScrollEl) || scrollElIsBordered ? clientTop * 2 : 0) -
          diffY -
          max(0, overflow.bottom)
      )
    )

    scrollEl.style.maxHeight = `${maxHeight}px`
    scrollEl.scrollTop = diffY

    // There is not enough space, fallback to standard anchored positioning
    if (onFallbackChange) {
      const shouldFallback =
        (scrollEl.scrollHeight > scrollEl.offsetHeight &&
          scrollEl.offsetHeight < item.offsetHeight * minItemsVisible - 1) ||
        refOverflow.top >= -referenceOverflowThreshold ||
        refOverflow.bottom >= -referenceOverflowThreshold

      onFallbackChange(shouldFallback)
      await tick()
    }

    if (overflowRef) {
      overflowRef.current = await detectOverflow(
        getArgsWithCustomFloatingHeight(
          { ...nextArgs, y: nextY },
          scrollEl.offsetHeight + clientTop + floating.clientTop
        ),
        detectOverflowOptions
      )
    }

    return {
      y: nextY,
    }
  },
})

export interface UseInnerOffsetProps {
  /**
   * Whether the Hook is enabled, including all internal Effects and event
   * handlers.
   * @default true
   */
  enabled?: boolean
  /**
   * A ref which contains the overflow of the floating element.
   */
  overflowRef: MutableRefObject<SideObject | null>
  /**
   * An optional ref containing an HTMLElement. This may be used as the
   * scrolling container instead of the floating element — for instance,
   * to position inner elements as direct children without being interfered by
   * scrolling layout.
   */
  scrollRef?: MutableRefObject<HTMLElement | null>
  /**
   * Callback invoked when the offset changes.
   */
  onChange: (offset: number | ((offset: number) => number)) => void
}

/**
 * Changes the `inner` middleware's `offset` upon a `wheel` event to
 * expand the floating element's height, revealing more list items.
 * @see https://floating-ui.com/docs/inner
 */
export function useInnerOffset(options: { context: FloatingRootContext; props: UseInnerOffsetProps }): ElementProps {
  const { context, props } = $derived(options)
  const { open, elements } = $derived(context)
  const { enabled = true, overflowRef, scrollRef, onChange: unstable_onChange } = $derived(props)

  const onChange = (() => unstable_onChange)()
  const controlledScrollingRef = $state<MutableRefObject<boolean>>({ current: false })
  const prevScrollTopRef = $state<MutableRefObject<number | null>>({ current: null })
  const initialOverflowRef = $state<MutableRefObject<SideObject | null>>({ current: null })

  $effect(() => {
    if (!enabled) return
    ;[enabled, open, elements.floating, overflowRef, scrollRef, onChange]
    untrack(() => {
      function onWheel(e: WheelEvent) {
        if (e.ctrlKey || !el || overflowRef.current == null) {
          return
        }

        const dY = e.deltaY
        const isAtTop = overflowRef.current.top >= -0.5
        const isAtBottom = overflowRef.current.bottom >= -0.5
        const remainingScroll = el.scrollHeight - el.clientHeight
        const sign = dY < 0 ? -1 : 1
        const method = dY < 0 ? "max" : "min"

        if (el.scrollHeight <= el.clientHeight) {
          return
        }

        if ((!isAtTop && dY > 0) || (!isAtBottom && dY < 0)) {
          e.preventDefault()
          onChange((d) => d + Math[method](dY, remainingScroll * sign))
          tick()
        } else if (/firefox/i.test(getUserAgent())) {
          // Needed to propagate scrolling during momentum scrolling phase once
          // it gets limited by the boundary. UX improvement, not critical.
          el.scrollTop += dY
        }
      }

      const el = scrollRef?.current || elements.floating

      if (open && el) {
        el.addEventListener("wheel", onWheel)

        // Wait for the position to be ready.
        requestAnimationFrame(() => {
          prevScrollTopRef.current = el.scrollTop

          if (overflowRef.current != null) {
            initialOverflowRef.current = { ...overflowRef.current }
          }
        })

        return () => {
          prevScrollTopRef.current = null
          initialOverflowRef.current = null
          el.removeEventListener("wheel", onWheel)
        }
      }
    })
  })

  const floating: ElementProps["floating"] = {
    onkeydown() {
      controlledScrollingRef.current = true
    },
    onwheel() {
      controlledScrollingRef.current = false
    },
    onpointermove() {
      controlledScrollingRef.current = false
    },
    async onscroll() {
      const el = scrollRef?.current || elements.floating

      if (!overflowRef.current || !el || !controlledScrollingRef.current) {
        return
      }

      if (prevScrollTopRef.current !== null) {
        const scrollDiff = el.scrollTop - prevScrollTopRef.current

        if (
          (overflowRef.current.bottom < -0.5 && scrollDiff < -1) ||
          (overflowRef.current.top < -0.5 && scrollDiff > 1)
        ) {
          onChange((d) => d + scrollDiff)
          await tick()
        }
      }

      // [Firefox] Wait for the height change to have been applied.
      requestAnimationFrame(() => {
        prevScrollTopRef.current = el.scrollTop
      })
    },
  }

  return {
    get floating() {
      return enabled ? floating : undefined
    },
  }
}
