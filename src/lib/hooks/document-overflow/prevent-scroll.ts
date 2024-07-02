import type { ScrollLockStep } from "./overflow-store.js"

export function preventScroll(): ScrollLockStep {
  return {
    before({ doc, d }) {
      d.style(doc.documentElement, "overflow", "hidden")
    },
  }
}
