import { useDisposables } from "$lib/utils/disposables.js"
import { useRef } from "$lib/utils/ref.svelte.js"
import {
  autoUpdate,
  flip as flipMiddleware,
  //inner as innerMiddleware,
  offset as offsetMiddleware,
  shift as shiftMiddleware,
  size as sizeMiddleware,
  useFloating as _useFloating,
  //useInnerOffset,
  useInteractions,
  //type InnerProps,
  type UseFloatingReturn,
} from "@skeletonlabs/floating-ui-svelte"
import { getContext, setContext } from "svelte"

type Align = "start" | "end"
type Placement = "top" | "right" | "bottom" | "left"

type BaseAnchorProps = {
  /**
   * The `gap` is the space between the trigger and the panel.
   */
  gap: number | string // For `var()` support

  /**
   * The `offset` is the amount the panel should be nudged from its original position.
   */
  offset: number | string // For `var()` support

  /**
   * The `padding` is the minimum space between the panel and the viewport.
   */
  padding: number | string // For `var()` support
}

export type AnchorProps =
  | false // Disable entirely
  | (`${Placement}` | `${Placement} ${Align}`) // String value to define the placement
  | Partial<
      BaseAnchorProps & {
        /**
         * The `to` value defines which side of the trigger the panel should be placed on and its
         * alignment.
         */
        to: `${Placement}` | `${Placement} ${Align}`
      }
    >

export type AnchorPropsWithSelection =
  | false // Disable entirely
  | (`${Placement | "selection"}` | `${Placement | "selection"} ${Align}`)
  | Partial<
      BaseAnchorProps & {
        /**
         * The `to` value defines which side of the trigger the panel should be placed on and its
         * alignment.
         */
        to: `${Placement | "selection"}` | `${Placement | "selection"} ${Align}`
      }
    >

export type InternalFloatingPanelProps = Partial<{
  inner: {
    //listRef: InnerProps['listRef']
    //index: InnerProps['index']
  }
}>

type FloatingContext = {
  styles?: UseFloatingReturn["floatingStyles"]
  setReference: (reference: HTMLElement | null | undefined) => void
  setFloating: (floating: HTMLElement | null | undefined) => void
  getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"]
  getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"]
  slot: Partial<{
    anchor: `${Placement | "selection"}` | `${Placement | "selection"} ${Align}`
  }>
}

type PlacementContext = ((value: Exclude<AnchorPropsWithSelection, boolean> | null) => void) | null

export function useResolvedAnchor<T extends AnchorProps | AnchorPropsWithSelection>(
  anchor?: T
): Exclude<T, boolean | string> | null {
  if (!anchor) return null // Disable entirely
  if (typeof anchor === "string") return { to: anchor } as Exclude<T, boolean | string> // Simple string based value,
  return anchor as Exclude<T, boolean | string> // User-provided value
}

export function useFloating() {
  return getContext<FloatingContext>("FloatingContext")
}

export function useFloatingPanelProps() {
  let { getFloatingProps, slot } = getContext<FloatingContext>("FloatingContext")
  return (...args: Parameters<typeof getFloatingProps>) => {
    return Object.assign({}, getFloatingProps(...args), {
      "data-anchor": slot.anchor,
    })
  }
}

export function useFloatingPanel(placement: (AnchorPropsWithSelection & InternalFloatingPanelProps) | null = null) {
  if (placement === false) placement = null // Disable entirely
  if (typeof placement === "string") placement = { to: placement } // Simple string based value

  const updatePlacementConfig = getContext<PlacementContext>("PlacementContext")
  /*let stablePlacement = useMemo(
      () => placement,
      [
        JSON.stringify(
          placement,
          typeof HTMLElement !== 'undefined'
            ? (_, v) => {
                if (v instanceof HTMLElement) {
                  return v.outerHTML
                }
                return v
              }
            : undefined
        ),
      ]
    )*/
  updatePlacementConfig?.(placement ?? null)

  const context = getContext<FloatingContext>("FloatingContext")

  return {
    get setFloating() {
      return context.setFloating
    },
    get style() {
      return placement ? context.styles : undefined
    },
  }
}

// TODO: Make this a config part of the `config`. Just need to decide on a name.
let MINIMUM_ITEMS_VISIBLE = 4

export const createFloatingContext = ({ enabled = true }: { enabled?: boolean } = {}): FloatingContext => {
  let config = $state<(AnchorPropsWithSelection & InternalFloatingPanelProps) | null>(null)
  let innerOffset = $state(0)
  let overflowRef = useRef(null)

  let floatingEl = $state<HTMLElement | null>(null)
  $effect(() => useFixScrollingPixel(floatingEl))

  const isEnabled = $derived(enabled && config !== null && floatingEl !== null)

  let {
    to: placement = "bottom",
    gap = 0,
    offset = 0,
    padding = 0,
    inner,
  } = useResolvedConfig({
    get config() {
      return config
    },
    get element() {
      return floatingEl
    },
  })
  let [to, align = "center"] = placement.split(" ") as [Placement | "selection", Align | "center"]

  // Reset
  $effect(() => {
    if (!isEnabled) return
    innerOffset = 0
  })

  const { elements, floatingStyles, context } = $derived(
    _useFloating({
      open: isEnabled,

      placement:
        to === "selection"
          ? align === "center"
            ? "bottom"
            : `bottom-${align}`
          : align === "center"
            ? `${to}`
            : `${to}-${align}`,

      // This component will be used in combination with a `Portal`, which means the floating
      // element will be rendered outside of the current DOM tree.
      strategy: "absolute",

      // We use the panel in a `Dialog` which is making the page inert, therefore no re-positioning is
      // needed when scrolling changes.
      transform: false,

      middleware: [
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
          ? null /* TODO: use inner when available: innerMiddleware({
              ...inner,
              padding, // For overflow detection
              overflowRef,
              offset: innerOffset,
              minItemsVisible: MINIMUM_ITEMS_VISIBLE,
              referenceOverflowThreshold: padding,
              onFallbackChange(fallback) {
                if (!fallback) return
                let parent = context.elements.floating
                if (!parent) return
                let scrollPaddingBottom =
                  parseFloat(getComputedStyle(parent!).scrollPaddingBottom) || 0
  
                // We want at least X visible items, but if there are less than X items in the list,
                // we want to show as many as possible.
                let missing = Math.min(MINIMUM_ITEMS_VISIBLE, parent.childElementCount)
  
                let elementHeight = 0
                let elementAmountVisible = 0
  
                for (let child of context.elements.floating?.childNodes ?? []) {
                  if (child instanceof HTMLElement) {
                    let childTop = child.offsetTop
                    // It can be that the child is fully visible, but we also want to keep the scroll
                    // padding into account to ensure the UI looks good. Therefore we fake that the
                    // bottom of the child is actually `scrollPaddingBottom` amount of pixels lower.
                    let childBottom = childTop + child.clientHeight + scrollPaddingBottom
  
                    let parentTop = parent.scrollTop
                    let parentBottom = parentTop + parent.clientHeight
  
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
                    let newInnerOffset =
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
            })*/
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
      ].filter(Boolean),
      whileElementsMounted: autoUpdate,
    })
  )

  // Calculate placement information to expose as data attributes
  let [exposedTo = to, exposedAlign = align] = context.placement.split("-")
  // If user-land code is using custom styles specifically for `bottom`, but
  // they chose `selection`, then we want to make sure to map it to selection
  // again otherwise styles could be wrong.
  if (to === "selection") exposedTo = "selection"

  const data = $derived({
    anchor: [exposedTo, exposedAlign].filter(Boolean).join(" ") as FloatingContext["slot"]["anchor"],
  })

  /*let innerOffsetConfig = useInnerOffset(context, {
      overflowRef,
      onChange: setInnerOffset,
    })*/
  let { getReferenceProps, getFloatingProps } = useInteractions([
    /*innerOffsetConfig*/
  ])

  let setFloatingRef = (el: HTMLElement | null | undefined) => {
    floatingEl = el || null
    elements.floating = el
  }

  /*
  
    return (
      <PlacementContext.Provider value={setConfig}>
        <FloatingContext.Provider
          value={{
            setFloating: setFloatingRef,
            setReference: refs.setReference,
            styles: floatingStyles,
            getReferenceProps,
            getFloatingProps,
            slot: data,
          }}
        >
          {children}
        </FloatingContext.Provider>
      </PlacementContext.Provider>
    )*/
  const floatingContext: FloatingContext = {
    setFloating: setFloatingRef,
    setReference: (reference) => {
      elements.reference = reference
    },
    get styles() {
      return floatingStyles
    },
    getReferenceProps,
    getFloatingProps,
    get slot() {
      return data
    },
  }

  setContext("FloatingContext", floatingContext)
  setContext<PlacementContext>("PlacementContext", null)

  return floatingContext
}

function useFixScrollingPixel(element: HTMLElement | null) {
  if (!element) return

  let observer = new MutationObserver(() => {
    let maxHeight = window.getComputedStyle(element).maxHeight

    let maxHeightFloat = parseFloat(maxHeight)
    if (isNaN(maxHeightFloat)) return

    let maxHeightInt = parseInt(maxHeight)
    if (isNaN(maxHeightInt)) return

    if (maxHeightFloat !== maxHeightInt) {
      element.style.maxHeight = `${Math.ceil(maxHeightFloat)}px`
    }
  })

  observer.observe(element, {
    attributes: true,
    attributeFilter: ["style"],
  })

  return () => {
    observer.disconnect()
  }
}

function useResolvedConfig({
  config,
  element,
}: {
  config: (Exclude<AnchorPropsWithSelection, boolean | string> & InternalFloatingPanelProps) | null
  element?: HTMLElement | null
}) {
  const gap = useResolvePxValue({
    get input() {
      return config?.gap ?? "var(--anchor-gap, 0)"
    },
    get element() {
      return element
    },
  })
  const offset = useResolvePxValue({
    get input() {
      return config?.gap ?? "var(--anchor-offset, 0)"
    },
    get element() {
      return element
    },
  })
  const padding = useResolvePxValue({
    get input() {
      return config?.gap ?? "var(--anchor-padding, 0)"
    },
    get element() {
      return element
    },
  })

  return {
    ...config,
    get gap() {
      return gap.value
    },
    get offset() {
      return offset.value
    },
    get padding() {
      return padding.value
    },
  }
}

function useResolvePxValue({
  input,
  element,
  defaultValue,
}: {
  input?: string | number
  element?: HTMLElement | null
  defaultValue?: number
}) {
  let d = useDisposables()
  const computeValue = (value?: string | number, element?: HTMLElement | null) => {
    // Nullish
    if (value == null) return [defaultValue, null] as const

    // Number as-is
    if (typeof value === "number") return [value, null] as const

    // String values, the interesting part
    if (typeof value === "string") {
      if (!element) return [defaultValue, null] as const

      let result = resolveCSSVariablePxValue(value, element)

      return [
        result,
        (setValue: (value?: number) => void) => {
          let variables = resolveVariables(value)

          // TODO: Improve this part and make it work
          //
          // Observe variables themselves. Currently the browser doesn't support this, but the
          // variables we are interested in resolve to a pixel value. Which means that we can use
          // this variable in the `margin` of an element. Then we can observe the `margin` of the
          // element and we will be notified when the variable changes.
          //
          // if (typeof ResizeObserver !== 'undefined') {
          //   let tmpEl = document.createElement('div')
          //   element.appendChild(tmpEl)
          //
          //   // Didn't use `fontSize` because a `fontSize` can't be negative.
          //   tmpEl.style.setProperty('margin-top', '0px', 'important')
          //
          //   // Set the new value, if this is invalid the previous value will be used.
          //   tmpEl.style.setProperty('margin-top', value, 'important')
          //
          //   let observer = new ResizeObserver(() => {
          //     let newResult = resolveCSSVariableValue(value, element)
          //
          //     if (result !== newResult) {
          //       setValue(newResult)
          //       result = newResult
          //     }
          //   })
          //   observer.observe(tmpEl)
          //   d.add(() => observer.disconnect())
          //   return d.dispose
          // }

          // Works as a fallback, but not very performant because we are polling the value.
          {
            let history = variables.map((variable) => window.getComputedStyle(element!).getPropertyValue(variable))

            d.requestAnimationFrame(function check() {
              d.nextFrame(check)

              // Fast path, detect if the value of the CSS Variable has changed before completely
              // computing the new value. Once we use `resolveCSSVariablePxValue` we will have to
              // compute the actual px value by injecting a temporary element into the DOM.
              //
              // This is a lot of work, so we want to avoid it if possible.
              let changed = false
              for (let [idx, variable] of variables.entries()) {
                let value = window.getComputedStyle(element!).getPropertyValue(variable)
                if (history[idx] !== value) {
                  history[idx] = value
                  changed = true
                  break
                }
              }

              // Nothing changed, no need to perform the expensive computation.
              if (!changed) return

              let newResult = resolveCSSVariablePxValue(value, element)

              if (result !== newResult) {
                setValue(newResult)
                result = newResult
              }
            })
          }

          return d.dispose
        },
      ] as const
    }

    return [defaultValue, null] as const
  }

  // Calculate the value immediately when the input or element changes. Later we can setup a watcher
  // to track the value changes over time.
  const immediateValue = computeValue(input, element)[0]
  let value = $state(immediateValue)

  $effect(() => {
    let [newValue, watcher] = computeValue(input, element)
    value = newValue

    if (!watcher) return
    return watcher((_value) => (value = _value))
  })

  return {
    get value() {
      return value
    },
  }
}

function resolveVariables(value: string): string[] {
  let matches = /var\((.*)\)/.exec(value)
  if (matches) {
    let idx = matches[1].indexOf(",")
    if (idx === -1) {
      return [matches[1]]
    }

    let variable = matches[1].slice(0, idx).trim()
    let fallback = matches[1].slice(idx + 1).trim()

    if (fallback) {
      return [variable, ...resolveVariables(fallback)]
    }

    return [variable]
  }

  return []
}

function resolveCSSVariablePxValue(input: string, element: HTMLElement) {
  // Resolve the value: Instead of trying to compute the value ourselves by converting rem /
  // vwh / ... values to pixels or by parsing out the fallback values and evaluating it
  // (because it can contain calc expressions or other variables).
  //
  // We will let the browser compute all of it by creating a temporary element and setting
  // the value as a CSS variable. Then we can read the computed value from the browser.
  //
  //
  // BUG REPORT ABOUT INCORRECT VALUES, look here:
  // ---------------------------------------------
  //
  // Currently this technically contains a bug because we are rendering a new element inside of the
  // current element. Which means that if the passed in element has CSS that looks like:
  //
  // ```css
  // .the-element {
  //   --the-variable: 1rem
  // }
  //
  // .the-element > * {
  //   --the-variable: 2rem
  // }
  // ```
  //
  // Then this will result to resolved value of `2rem`, instead of `1rem`
  let tmpEl = document.createElement("div")
  element.appendChild(tmpEl)

  // Set the value to `0px` otherwise if an invalid value is provided later the browser will read
  // out the default value.
  //
  // Didn't use `fontSize` because a `fontSize` can't be negative.
  tmpEl.style.setProperty("margin-top", "0px", "important")

  // Set the new value, if this is invalid the previous value will be used.
  tmpEl.style.setProperty("margin-top", input, "important")

  // Reading the `margin-top` will already be in pixels (e.g.: 123px).
  let pxValue = parseFloat(window.getComputedStyle(tmpEl).marginTop) || 0
  element.removeChild(tmpEl)

  return pxValue
}
