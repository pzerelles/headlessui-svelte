import { getTextValue } from "../utils/get-text-value.js"

export function useTextValue(options: { element: HTMLElement | null }) {
  const { element } = $derived(options)
  let cacheKey = $state("")
  let cacheValue = $state("")

  return () => {
    if (!element) return ""

    // Check for a cached version
    let currentKey = element.innerText
    if (cacheKey === currentKey) {
      return cacheValue
    }

    // Calculate the value
    let value = getTextValue(element).trim().toLowerCase()
    cacheKey = currentKey
    cacheValue = value
    return value
  }
}
