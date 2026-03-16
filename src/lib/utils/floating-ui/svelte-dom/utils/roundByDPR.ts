import { getDPR } from "$lib/utils/floating-ui/svelte-dom/utils/getDPR.js"

export function roundByDPR(element: Element, value: number) {
  const dpr = getDPR(element)
  return Math.round(value * dpr) / dpr
}
