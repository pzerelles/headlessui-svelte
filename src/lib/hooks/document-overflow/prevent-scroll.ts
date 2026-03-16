import type { ScrollLockStep } from "$lib/hooks/document-overflow/overflow-store.js"

export function preventScroll(): ScrollLockStep {
  return {
    before({ doc, d }) {
      d.style(doc.documentElement, "overflow", "hidden")
    },
  }
}
