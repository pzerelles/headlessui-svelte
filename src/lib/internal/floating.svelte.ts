import { useInteractions, type InnerProps, type UseFloatingReturn } from "../utils/floating-ui/svelte/index.js"
import { useDisposables } from "../utils/disposables.js"
import { getContext, untrack } from "svelte"

export { useFloatingProvider } from "./floating-provider.svelte.js"

export type Align = "start" | "end"
export type Placement = "top" | "right" | "bottom" | "left"

export type BaseAnchorProps = {
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
    listRef: InnerProps["listRef"]
    index: InnerProps["index"]
  }
}>

export type FloatingContext = {
  styles?: UseFloatingReturn<any>["floatingStyles"]
  setReference: UseFloatingReturn<any>["refs"]["setReference"]
  setFloating: UseFloatingReturn<any>["refs"]["setFloating"]
  getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"]
  getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"]
  slot: Partial<{
    anchor: `${Placement | "selection"}` | `${Placement | "selection"} ${Align}`
  }>
}

export type PlacementContext = {
  updatePlacementConfig: ((value: Exclude<AnchorPropsWithSelection, boolean> | null) => void) | null
}

export function useResolvedAnchor<T extends AnchorProps | AnchorPropsWithSelection>(options: {
  anchor?: T
}): { anchor: Exclude<T, boolean | string> | null } {
  const { anchor } = $derived(options)
  return {
    get anchor() {
      if (!anchor) return null // Disable entirely
      if (typeof anchor === "string") return { to: anchor } as Exclude<T, boolean | string> // Simple string based value,
      return anchor as Exclude<T, boolean | string> // User-provided value
    },
  }
}

export function useFloatingReference() {
  const context = getContext<FloatingContext>("FloatingContext")
  return {
    get setReference() {
      return context.setReference
    },
  }
}

export function useFloatingReferenceProps() {
  const context = getContext<FloatingContext>("FloatingContext")
  return {
    get getReferenceProps() {
      return context.getReferenceProps
    },
  }
}

export function useFloatingPanelProps() {
  const context = getContext<FloatingContext>("FloatingContext")
  const { getFloatingProps, slot } = $derived(context)
  return (...args: Parameters<typeof getFloatingProps>) => {
    return Object.assign({}, getFloatingProps(...args), {
      "data-anchor": slot.anchor,
    })
  }
}

export function useFloatingPanel(
  options: { placement: (AnchorPropsWithSelection & InternalFloatingPanelProps) | null } = { placement: null }
) {
  const placement = $derived(
    options.placement === false
      ? null
      : typeof options.placement === "string"
        ? { to: options.placement }
        : options.placement
  )
  //if (placement === false) placement = null // Disable entirely
  //if (typeof placement === "string") placement = { to: placement } // Simple string based value

  const placementContext = getContext<PlacementContext>("PlacementContext")
  const { updatePlacementConfig } = $derived(placementContext)
  const trigger = $derived(
    JSON.stringify(
      placement,
      typeof HTMLElement !== "undefined"
        ? (_, v) => {
            if (v instanceof HTMLElement) {
              return v.outerHTML
            }
            return v
          }
        : undefined
    )
  )
  const stablePlacement = $derived.by(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    trigger
    return untrack(() => placement)
  })
  $effect(() => {
    updatePlacementConfig?.(stablePlacement ?? null)
  })

  const context = getContext<FloatingContext>("FloatingContext")

  return {
    get setFloating() {
      return context.setFloating
    },
    get styles() {
      return placement ? context.styles : undefined
    },
  }
}

export function useFixScrollingPixel(options: { element: HTMLElement | null }) {
  const { element } = $derived(options)
  $effect(() => {
    if (!element) return

    untrack(() => {
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
    })
  })
}

export function useResolvedConfig(options: {
  config: (Exclude<AnchorPropsWithSelection, boolean | string> & InternalFloatingPanelProps) | null
  element?: HTMLElement | null
}) {
  const { config, element } = $derived(options)
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
      return config?.offset ?? "var(--anchor-offset, 0)"
    },
    get element() {
      return element
    },
  })
  const padding = useResolvePxValue({
    get input() {
      return config?.padding ?? "var(--anchor-padding, 0)"
    },
    get element() {
      return element
    },
  })

  return {
    get to() {
      return config?.to
    },
    get gap() {
      return gap.value
    },
    get offset() {
      return offset.value
    },
    get padding() {
      return padding.value
    },
    get inner() {
      return config?.inner
    },
  }
}

function useResolvePxValue(options: { input?: string | number; element?: HTMLElement | null; defaultValue?: number }) {
  const { input, element, defaultValue } = $derived(options)
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
  const immediateValue = $derived(computeValue(input, element)[0])
  let explicitValue = $state<number>()
  const setValue = (value?: number) => (explicitValue = value)
  const value = $derived(explicitValue ?? immediateValue)

  $effect(() => {
    const [value, watcher] = computeValue(input, element)
    setValue(value)

    if (!watcher) return
    return watcher(setValue)
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
