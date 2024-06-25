import { BROWSER } from "esm-env"

export function getOwnerDocument<T extends Element>(element: T | null | undefined) {
  if (!BROWSER) return null
  if (element instanceof Node) return element.ownerDocument

  return document
}
