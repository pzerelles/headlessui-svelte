import { computePosition } from "@floating-ui/dom"

import type {
  ComputePositionConfig,
  ReferenceType,
  UseFloatingData,
  UseFloatingOptions,
  UseFloatingReturn,
} from "./types.js"
import { deepEqual } from "./utils/deepEqual.js"
import { getDPR } from "./utils/getDPR.js"
import { roundByDPR } from "./utils/roundByDPR.js"
import { useLatestRef } from "./utils/useLatestRef.js"
import type { MutableRefObject } from "$lib/utils/ref.svelte.js"
import { tick, untrack } from "svelte"
import { stylePropsToString } from "$lib/utils/style.js"

/**
 * Provides data to position a floating element.
 * @see https://floating-ui.com/docs/useFloating
 */
export function useFloating<RT extends ReferenceType = ReferenceType>(
  options: UseFloatingOptions = {}
): UseFloatingReturn<RT> {
  const {
    placement = "bottom",
    strategy = "absolute",
    middleware = [],
    platform,
    elements: externalElements = {},
    transform = true,
    whileElementsMounted,
    open,
  } = $derived(options)
  const { reference: externalReference, floating: externalFloating } = $derived(externalElements)

  let data = $state<UseFloatingData>({
    x: 0,
    y: 0,
    strategy,
    placement,
    middlewareData: {},
    isPositioned: false,
  })
  const setData = (value: UseFloatingData) => (data = value)

  let latestMiddleware = $state(middleware)

  $effect(() => {
    if (!deepEqual(latestMiddleware, middleware)) {
      latestMiddleware = middleware
    }
  })

  let _reference = $state<RT | null>(null)
  let _floating = $state<HTMLElement | null>(null)

  const setReference = (node: RT | null | undefined) => {
    if ((node ?? null) !== referenceRef.current) {
      referenceRef.current = node ?? null
      _reference = node ?? null
    }
  }

  const setFloating = (node: HTMLElement | null | undefined) => {
    if ((node ?? null) !== floatingRef.current) {
      floatingRef.current = node ?? null
      _floating = node ?? null
    }
  }

  const referenceEl = $derived((externalReference || _reference) as RT | null)
  const floatingEl = $derived(externalFloating || _floating)

  const referenceRef = $state<MutableRefObject<RT | null>>({ current: null })
  const floatingRef = $state<MutableRefObject<HTMLElement | null>>({ current: null })
  const dataRef = $state<MutableRefObject<typeof data>>({ current: data })

  const hasWhileElementsMounted = whileElementsMounted != null
  const whileElementsMountedRef = useLatestRef({
    get value() {
      return whileElementsMounted
    },
  })
  const platformRef = useLatestRef({
    get value() {
      return platform
    },
  })
  const openRef = useLatestRef({
    get value() {
      return open
    },
  })

  const update = () => {
    if (!referenceRef.current || !floatingRef.current) {
      return
    }

    const config: ComputePositionConfig = {
      placement,
      strategy,
      middleware: latestMiddleware,
    }

    if (platformRef.current) {
      config.platform = platformRef.current
    }

    computePosition(referenceRef.current, floatingRef.current, config).then(async (data) => {
      const fullData = {
        ...data,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: openRef.current !== false,
      }
      if (isMountedRef.current && !deepEqual(dataRef.current, fullData)) {
        dataRef.current = fullData
        setData(fullData)
        await tick()
      }
    })
  }

  $effect(() => {
    open
    untrack(() => {
      if (open === false && dataRef.current.isPositioned) {
        dataRef.current.isPositioned = false
        data.isPositioned = false
      }
    })
  })

  const isMountedRef = $state<MutableRefObject<boolean>>({ current: false })
  $effect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  })

  $effect(() => {
    if (referenceEl) referenceRef.current = referenceEl
    if (floatingEl) floatingRef.current = floatingEl

    if (referenceEl && floatingEl) {
      if (whileElementsMountedRef.current) {
        return whileElementsMountedRef.current(referenceEl, floatingEl, update)
      }

      update()
    }
  }) //, [referenceEl, floatingEl, update, whileElementsMountedRef, hasWhileElementsMounted])

  const refs = $derived({
    reference: referenceRef,
    floating: floatingRef,
    setReference,
    setFloating,
  })

  const elements = $derived({ reference: referenceEl, floating: floatingEl })

  const floatingStyles = $derived.by(() => {
    const initialStyles = {
      position: strategy,
      left: 0,
      top: 0,
    }

    if (!elements.floating) {
      return stylePropsToString(initialStyles)
    }

    const x = roundByDPR(elements.floating, data.x)
    const y = roundByDPR(elements.floating, data.y)

    if (transform) {
      return stylePropsToString({
        ...initialStyles,
        transform: `translate(${x}px, ${y}px)`,
        ...(getDPR(elements.floating) >= 1.5 && { "will-change": "transform" }),
      })
    }

    return stylePropsToString({
      position: strategy,
      left: x,
      top: y,
    })
  })

  return {
    get placement() {
      return data.placement
    },
    get strategy() {
      return data.strategy
    },
    get middlewareData() {
      return data.middlewareData
    },
    get x() {
      return data.x
    },
    get y() {
      return data.y
    },
    get isPositioned() {
      return data.isPositioned
    },
    update,
    get refs() {
      return refs
    },
    get elements() {
      return elements
    },
    get floatingStyles() {
      return floatingStyles
    },
  }
}
