import { setContext } from "svelte"
import {
  useFixScrollingPixel,
  useResolvedConfig,
  type Align,
  type AnchorPropsWithSelection,
  type FloatingContext,
  type InternalFloatingPanelProps,
  type Placement,
  type PlacementContext,
} from "./floating.svelte.js"
import {
  autoUpdate,
  flip as flipMiddleware,
  inner as innerMiddleware,
  offset as offsetMiddleware,
  shift as shiftMiddleware,
  size as sizeMiddleware,
  useFloating,
  useInnerOffset,
  useInteractions,
} from "../utils/floating-ui/svelte/index.js"
import type { UseFloatingOptions } from "$lib/utils/floating-ui/svelte-dom/types.js"

export const useFloatingProvider = (options: { enabled: boolean } = { enabled: true }) => {
  const { enabled } = $derived(options)

  // TODO: Make this a config part of the `config`. Just need to decide on a name.
  const MINIMUM_ITEMS_VISIBLE = 4

  let config = $state<(AnchorPropsWithSelection & InternalFloatingPanelProps) | null>(null)
  let innerOffset = $state(0)
  const setInnerOffset = (offset: number | ((offset: number) => number)) =>
    (innerOffset = typeof offset === "function" ? offset(innerOffset) : offset)
  const overflowRef = $state({ current: null })

  let floatingEl = $state<HTMLElement | null>(null)
  const setFloatingElement = (element: HTMLElement | null | undefined) => (floatingEl = element ?? null)
  useFixScrollingPixel({
    get element() {
      return floatingEl
    },
  })

  const isEnabled = $derived(enabled && config !== null && floatingEl !== null)

  const resolvedConfig = useResolvedConfig({
    get config() {
      return config
    },
    get element() {
      return floatingEl
    },
  })
  const { to: placement = "bottom", gap = 0, offset = 0, padding = 0, inner } = $derived(resolvedConfig)
  const [to, align = "center"] = $derived(placement.split(" ") as [Placement | "selection", Align | "center"])

  // Reset
  $effect(() => {
    if (!isEnabled) return
    innerOffset = 0
  })

  const middleware = $derived(
    [
      // - The `mainAxis` is set to `gap` which defines the gap between the panel and the
      //   trigger/reference.
      // - The `crossAxis` is set to `offset` which nudges the panel from its original position.
      //
      // When we are showing the panel on top of the selected item, we don't want a gap between the
      // reference and the panel, therefore setting the `mainAxis` to `0`.
      offsetMiddleware({
        mainAxis: to === "selection" ? 0 : gap,
        crossAxis: offset,
      }),

      // When the panel overflows the viewport, we will try to nudge the panel to the other side to
      // ensure it's not clipped. We use the `padding` to define the  minimum space between the
      // panel and the viewport.
      shiftMiddleware({ padding }),

      // The `flip` middleware will swap the `placement` of the panel if there is not enough room.
      // This is not compatible with the `inner` middleware (which is only enabled when `to` is set
      // to "selection").
      to !== "selection" && flipMiddleware({ padding }),

      // The `inner` middleware will ensure the panel is always fully visible on screen and
      // positioned on top of the reference and moved to the currently selected item.
      to === "selection" && inner
        ? innerMiddleware({
            ...inner,
            padding, // For overflow detection
            overflowRef,
            offset: innerOffset,
            minItemsVisible: MINIMUM_ITEMS_VISIBLE,
            referenceOverflowThreshold: padding,
            onFallbackChange(fallback) {
              if (!fallback) return
              const parent = context.elements.floating
              if (!parent) return
              const scrollPaddingBottom = parseFloat(getComputedStyle(parent!).scrollPaddingBottom) || 0

              // We want at least X visible items, but if there are less than X items in the list,
              // we want to show as many as possible.
              let missing = Math.min(MINIMUM_ITEMS_VISIBLE, parent.childElementCount)

              let elementHeight = 0
              let elementAmountVisible = 0

              for (const child of context.elements.floating?.childNodes ?? []) {
                if (child instanceof HTMLElement) {
                  const childTop = child.offsetTop
                  // It can be that the child is fully visible, but we also want to keep the scroll
                  // padding into account to ensure the UI looks good. Therefore we fake that the
                  // bottom of the child is actually `scrollPaddingBottom` amount of pixels lower.
                  const childBottom = childTop + child.clientHeight + scrollPaddingBottom

                  const parentTop = parent.scrollTop
                  const parentBottom = parentTop + parent.clientHeight

                  // Figure out if the child is fully visible in the scroll parent.
                  if (childTop >= parentTop && childBottom <= parentBottom) {
                    missing--
                  } else {
                    // Not fully visible, so we will use this child to calculate the height of
                    // each item. We will also use this to calculate how much of the item is
                    // already visible.
                    elementAmountVisible = Math.max(
                      0,
                      Math.min(childBottom, parentBottom) - Math.max(childTop, parentTop)
                    )
                    elementHeight = child.clientHeight
                    break
                  }
                }
              }

              // There are fewer visible items than we want, so we will try to nudge the offset
              // to show more items.
              if (missing >= 1) {
                setInnerOffset((existingOffset) => {
                  const newInnerOffset =
                    elementHeight * missing - // `missing` amount of `elementHeight`
                    elementAmountVisible + // The amount of the last item that is visible
                    scrollPaddingBottom // The scroll padding to ensure the UI looks good

                  // Nudged enough already, no need to continue
                  if (existingOffset >= newInnerOffset) {
                    return existingOffset
                  }

                  return newInnerOffset
                })
              }
            },
          })
        : null,

      // The `size` middleware will ensure the panel is never bigger than the viewport minus the
      // provided `padding` that we want.
      sizeMiddleware({
        padding,
        apply({ availableWidth, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            overflow: "auto",
            maxWidth: `${availableWidth}px`,
            maxHeight: `min(var(--anchor-max-height, 100vh), ${availableHeight}px)`,
          })
        },
      }),
    ].filter(Boolean)
  )

  const floating = useFloating({
    get open() {
      return isEnabled
    },

    get placement() {
      return (
        to === "selection"
          ? align === "center"
            ? "bottom"
            : `bottom-${align}`
          : align === "center"
            ? `${to}`
            : `${to}-${align}`
      ) as UseFloatingOptions["placement"]
    },

    // This component will be used in combination with a `Portal`, which means the floating
    // element will be rendered outside of the current DOM tree.
    strategy: "absolute",

    // We use the panel in a `Dialog` which is making the page inert, therefore no re-positioning is
    // needed when scrolling changes.
    transform: false,

    get middleware() {
      return middleware
    },
    whileElementsMounted: autoUpdate,
  })
  const { refs, floatingStyles, context } = $derived(floating)

  // Calculate placement information to expose as data attributes
  const { exposedTo, exposedAlign } = $derived.by(() => {
    const [exposedTo = to, exposedAlign = align] = context.placement.split("-")
    return { exposedTo: to === "selection" ? "selection" : exposedTo, exposedAlign }
  })
  // If user-land code is using custom styles specifically for `bottom`, but
  // they chose `selection`, then we want to make sure to map it to selection
  // again otherwise styles could be wrong.
  //if (to === "selection") exposedTo = "selection"

  const data = $derived({
    anchor: [exposedTo, exposedAlign].filter(Boolean).join(" ") as FloatingContext["slot"]["anchor"],
  })

  const innerOffsetConfig = useInnerOffset({
    get context() {
      return context
    },
    get props() {
      return {
        overflowRef,
        onChange: setInnerOffset,
      }
    },
  })
  const { getReferenceProps, getFloatingProps } = useInteractions({
    get propsList() {
      return [innerOffsetConfig]
    },
  })

  const setFloatingRef = (el: HTMLElement | null | undefined) => {
    setFloatingElement(el)
    refs.setFloating(el)
  }

  setContext<PlacementContext>("PlacementContext", {
    updatePlacementConfig: (value: Exclude<AnchorPropsWithSelection, boolean> | null) => {
      config = value
    },
  })

  setContext<FloatingContext>("FloatingContext", {
    setFloating: setFloatingRef,
    get setReference() {
      return refs.setReference
    },
    get styles() {
      return floatingStyles
    },
    getReferenceProps,
    getFloatingProps,
    get slot() {
      return data
    },
  })
}
