import { isElement } from "@floating-ui/utils/dom"
import type { FloatingRootContext, ReferenceElement } from "../types.js"
import type { ContextData, OpenChangeReason } from "../types.js"
//import { useEffectEvent } from "./utils/useEffectEvent"
import { createPubSub } from "../utils/createPubSub.js"
import { useId } from "./useId.svelte.js"
import { useFloatingParentNodeId } from "../components/FloatingTree.svelte"
import { error } from "../utils/log.js"
import type { MutableRefObject } from "../../../../utils/ref.svelte.js"
import { DEV } from "esm-env"

export interface UseFloatingRootContextOptions {
  open?: boolean
  onOpenChange?: (open: boolean, event?: Event, reason?: OpenChangeReason) => void
  elements: {
    reference: Element | null
    floating: HTMLElement | null
  }
}

export function useFloatingRootContext(options: UseFloatingRootContextOptions): FloatingRootContext {
  const { open = false, onOpenChange: onOpenChangeProp, elements: elementsProp } = options

  const floatingId = useId()
  const dataRef = $state<MutableRefObject<ContextData>>({ current: {} })
  const events = createPubSub()
  const nested = useFloatingParentNodeId() != null

  if (DEV) {
    const optionDomReference = elementsProp.reference
    if (optionDomReference && !isElement(optionDomReference)) {
      error(
        "Cannot pass a virtual element to the `elements.reference` option,",
        "as it must be a real DOM element. Use `refs.setPositionReference()`",
        "instead."
      )
    }
  }

  let positionReference = $state<ReferenceElement | null>(elementsProp.reference)

  const onOpenChange = (open: boolean, event?: Event, reason?: OpenChangeReason) => {
    dataRef.current.openEvent = open ? event : undefined
    events.emit("openchange", { open, event, reason, nested })
    onOpenChangeProp?.(open, event, reason)
  }

  const refs = {
    setPositionReference: (value: ReferenceElement | null | undefined) => {
      positionReference = value ?? null
    },
  }

  const elements = $derived({
    reference: positionReference || elementsProp.reference || null,
    floating: elementsProp.floating || null,
    domReference: elementsProp.reference as Element | null,
  })

  return {
    get dataRef() {
      return dataRef
    },
    get open() {
      return open
    },
    onOpenChange,
    get elements() {
      return elements
    },
    events,
    get floatingId() {
      return floatingId
    },
    refs,
  }
}
