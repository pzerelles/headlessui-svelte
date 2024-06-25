import { getOwnerDocument } from "./owner.js"

export const getOwnerWindow = (el: (Window & typeof global) | Element | null | undefined): Window & typeof global => {
  if (el && "window" in el && el.window === el) {
    return el
  }

  const doc = getOwnerDocument(el as Element | null | undefined)
  return doc?.defaultView || window
}
