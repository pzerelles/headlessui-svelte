export function useDidElementMove(options: { enabled: boolean; element: HTMLElement | null }): {
  readonly value: boolean
} {
  const { enabled, element } = $derived(options)
  let elementPosition = $state<DOMRect>()

  $effect(() => {
    if (!element) return

    const DOMRect = element.getBoundingClientRect()
    if (DOMRect) elementPosition = DOMRect
  })

  const value = $derived.by(() => {
    if (element == null || !enabled || element === document.activeElement || elementPosition === undefined) return false

    const buttonRect = element.getBoundingClientRect()
    return buttonRect.top !== elementPosition.top || buttonRect.left !== elementPosition.left
  })

  return {
    get value() {
      return value
    },
  }
}
