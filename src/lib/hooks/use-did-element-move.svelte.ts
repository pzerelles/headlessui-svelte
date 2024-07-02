export function useDidElementMove(options: { enabled: boolean; element: HTMLElement | null }): {
  readonly value: boolean
} {
  const { enabled, element } = $derived(options)
  let elementPosition = $state({ left: 0, top: 0 })

  $effect(() => {
    if (!element) return

    let DOMRect = element.getBoundingClientRect()
    if (DOMRect) elementPosition = DOMRect
  })

  const value = $derived.by(() => {
    if (element == null) return false
    if (!enabled) return false
    if (element === document.activeElement) return false

    let buttonRect = element.getBoundingClientRect()

    let didElementMove = buttonRect.top !== elementPosition.top || buttonRect.left !== elementPosition.left

    return didElementMove
  })

  return {
    get value() {
      return value
    },
  }
}
