// let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled })

import { disposables } from "../utils/disposables.js"

let globalIgnoreEmulatedMouseEvents = false
let hoverCount = 0
const d = disposables()

function setGlobalIgnoreEmulatedMouseEvents() {
  globalIgnoreEmulatedMouseEvents = true

  // Clear globalIgnoreEmulatedMouseEvents after a short timeout. iOS fires onPointerEnter
  // with pointerType="mouse" immediately after onPointerUp and before onFocus. On other
  // devices that don't have this quirk, we don't want to ignore a mouse hover sometime in
  // the distant future because a user previously touched the element.
  setTimeout(() => {})
}

function handleGlobalPointerEvent(e: PointerEvent) {
  if (e.pointerType === "touch") {
    setGlobalIgnoreEmulatedMouseEvents()
  }
}

export interface HoverEvent {
  /** The type of hover event being fired. */
  type: "hoverstart" | "hoverend"
  /** The pointer type that triggered the hover event. */
  pointerType: "mouse" | "pen"
  /** The target element of the hover event. */
  target: Element
}

type HoverPointerType = HoverEvent["pointerType"] | "touch"

function isHoverPointerType(pointerType: string): pointerType is HoverPointerType {
  return pointerType === "mouse" || pointerType === "pen" || pointerType === "touch"
}

function setupGlobalTouchEvents() {
  if (typeof document === "undefined" || !document) return

  if (hoverCount === 0) {
    if (typeof PointerEvent !== "undefined") {
      d.addEventListener(document, "pointerup", handleGlobalPointerEvent)
    } else {
      d.addEventListener(document, "touchend", setGlobalIgnoreEmulatedMouseEvents)
    }
  }

  hoverCount++

  return () => {
    hoverCount--
    if (hoverCount === 0) d.dispose()
  }
}

type HoverState = {
  isHovered: boolean
  ignoreEmulatedMouseEvents: boolean
  pointerType: string
  target: Element | null
}

export const useHover = (options: { disabled?: boolean } = {}) => {
  const { disabled } = $derived(options)

  const _state = $state<HoverState>({
    isHovered: false,
    ignoreEmulatedMouseEvents: false,
    pointerType: "",
    target: null,
  })

  $effect(() => setupGlobalTouchEvents())

  $effect(() => {
    if (disabled) {
      _state.pointerType = ""
      _state.target = null
      _state.isHovered = false
    }
  })

  function triggerHoverStart(originalEvent: MouseEvent | PointerEvent, pointerType: HoverPointerType) {
    _state.pointerType = pointerType ?? undefined

    const target = originalEvent.currentTarget
    if (!(target instanceof HTMLElement || target instanceof SVGElement)) return

    if (disabled || pointerType === "touch" || _state.isHovered || !target.contains(originalEvent.target as Element)) {
      return
    }

    _state.isHovered = true
    _state.target = target
  }

  function triggerHoverEnd(originalEvent: MouseEvent | PointerEvent, pointerType: HoverPointerType) {
    _state.pointerType = ""
    _state.target = null
    const currentTarget = originalEvent.currentTarget

    if (pointerType === "touch" || !_state.isHovered || !(currentTarget instanceof HTMLElement)) return

    _state.isHovered = false
  }

  function handlePointerEnter(e: PointerEvent) {
    const pointerType = e.pointerType
    if (!isHoverPointerType(pointerType)) return
    if (globalIgnoreEmulatedMouseEvents && e.pointerType === "mouse") return

    triggerHoverStart(e, pointerType)
  }

  function handlePointerLeave(e: PointerEvent) {
    const pointerType = e.pointerType
    const currentTarget = e.currentTarget
    if (
      disabled ||
      !(currentTarget instanceof HTMLElement) ||
      !currentTarget.contains(e.target as Element) ||
      !isHoverPointerType(pointerType)
    ) {
      return
    }
    triggerHoverEnd(e, pointerType)
  }

  function handleTouchStart() {
    _state.ignoreEmulatedMouseEvents = true
  }

  function handleMouseEnter(e: MouseEvent) {
    if (!_state.ignoreEmulatedMouseEvents && !globalIgnoreEmulatedMouseEvents) {
      triggerHoverStart(e, "mouse")
    }

    _state.ignoreEmulatedMouseEvents = false
  }

  function handleMouseLeave(e: MouseEvent) {
    const currentTarget = e.currentTarget
    if (disabled || !(currentTarget instanceof HTMLElement) || !currentTarget.contains(e.target as Element)) return
    triggerHoverEnd(e, "mouse")
  }

  return {
    get isHovered() {
      return _state.isHovered
    },
    hoverProps:
      typeof PointerEvent !== "undefined"
        ? {
            onpointerenter: handlePointerEnter,
            onpointerleave: handlePointerLeave,
          }
        : {
            onmouseenter: handleMouseEnter,
            onmouseleave: handleMouseLeave,
            ontouchstart: handleTouchStart,
          },
  }
}
