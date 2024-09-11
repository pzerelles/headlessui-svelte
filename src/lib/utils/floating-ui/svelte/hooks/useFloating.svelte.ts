import { useFloating as usePosition } from "../../svelte-dom/index.js"
import { isElement } from "@floating-ui/utils/dom"

import { useFloatingTree } from "../components/FloatingTree.svelte"
import type {
  FloatingContext,
  NarrowedElement,
  ReferenceType,
  UseFloatingOptions,
  UseFloatingReturn,
} from "../types.js"
import { useFloatingRootContext } from "./useFloatingRootContext.svelte.js"
import type { MutableRefObject } from "$lib/utils/ref.svelte.js"

/**
 * Provides data to position a floating element and context to add interactions.
 * @see https://floating-ui.com/docs/useFloating
 */
export function useFloating<RT extends ReferenceType = ReferenceType>(
  options: UseFloatingOptions = {}
): UseFloatingReturn<RT> {
  const { nodeId } = $derived(options)

  const internalRootContext = useFloatingRootContext({
    get open() {
      return options.open
    },
    get onOpenChange() {
      return options.onOpenChange
    },
    get elements() {
      return {
        reference: null,
        floating: null,
        ...options.elements,
      }
    },
  })

  const rootContext = $derived(options.rootContext || internalRootContext)
  const computedElements = $derived(rootContext.elements)

  let _domReference = $state<NarrowedElement<RT> | null>(null)
  const setDomReference = (value: NarrowedElement<RT> | null) => (_domReference = value)
  let positionReference = $state<ReferenceType | null>(null)
  const _setPositionReference = (value: ReferenceType | null) => (positionReference = value)

  const optionDomReference = $derived(computedElements?.reference)
  const domReference = $derived((optionDomReference || _domReference) as NarrowedElement<RT>)
  const domReferenceRef = $state<MutableRefObject<NarrowedElement<RT> | null>>({ current: null })

  const tree = useFloatingTree()

  $effect(() => {
    if (domReference) {
      domReferenceRef.current = domReference
    }
  })

  const position = usePosition({
    get placement() {
      return options.placement
    },
    get strategy() {
      return options.strategy
    },
    get middleware() {
      return options.middleware
    },
    get platform() {
      return options.platform
    },
    get whileElementsMounted() {
      return options.whileElementsMounted
    },
    get open() {
      return options.open
    },
    get transform() {
      return options.transform
    },
    get elements() {
      return {
        ...computedElements,
        ...(positionReference && { reference: positionReference }),
      }
    },
  })

  const setPositionReference = (node: ReferenceType | null) => {
    const computedPositionReference = isElement(node)
      ? {
          getBoundingClientRect: () => node.getBoundingClientRect(),
          contextElement: node,
        }
      : node
    // Store the positionReference in state if the DOM reference is specified externally via the
    // `elements.reference` option. This ensures that it won't be overridden on future renders.
    _setPositionReference(computedPositionReference)
    position.refs.setReference(computedPositionReference)
  }

  const setReference = (node: RT | null) => {
    if (isElement(node) || node === null) {
      ;(domReferenceRef as MutableRefObject<Element | null>).current = node
      setDomReference(node as NarrowedElement<RT> | null)
    }

    // Backwards-compatibility for passing a virtual element to `reference`
    // after it has set the DOM reference.
    if (
      isElement(position.refs.reference.current) ||
      position.refs.reference.current === null ||
      // Don't allow setting virtual elements using the old technique back to
      // `null` to support `positionReference` + an unstable `reference`
      // callback ref.
      (node !== null && !isElement(node))
    ) {
      position.refs.setReference(node)
    }
  }

  const refs = $derived({
    ...position.refs,
    setReference,
    setPositionReference,
    domReference: domReferenceRef,
  })

  const elements = $derived({
    ...position.elements,
    domReference: domReference,
  })

  const context = $derived({
    ...position,
    ...rootContext,
    refs,
    elements,
    nodeId,
  })

  $effect(() => {
    rootContext.dataRef.current.floatingContext = context

    const node = tree?.nodesRef.current.find((node) => node.id === nodeId)
    if (node) {
      node.context = context
    }
  })

  return {
    get placement() {
      return position.placement
    },
    get strategy() {
      return position.strategy
    },
    get middlewareData() {
      return position.middlewareData
    },
    get x() {
      return position.x
    },
    get y() {
      return position.y
    },
    get isPositioned() {
      return position.isPositioned
    },
    get update() {
      return position.update
    },
    get floatingStyles() {
      return position.floatingStyles
    },
    get context() {
      return context
    },
    get refs() {
      return refs
    },
    get elements() {
      return elements
    },
  } as UseFloatingReturn<RT>
}
