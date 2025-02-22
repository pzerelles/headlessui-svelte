function computeSize(element: HTMLElement | null) {
  if (element === null) return { width: 0, height: 0 }
  const { width, height } = element.getBoundingClientRect()
  return { width, height }
}

export function useElementSize(options: { element: HTMLElement | null; unit: boolean }) {
  const { element, unit = false } = $derived(options)

  // When the element changes during a re-render, we want to make sure we
  // compute the correct size as soon as possible. However, once the element is
  // stable, we also want to watch for changes to the element. The `identity`
  // state can be used to recompute the size.
  let size = $state((() => computeSize(element))())

  const observeSize = (element: HTMLElement | null) => {
    if (!element) return
    const observer = new ResizeObserver(() => {
      const { width, height } = computeSize(element)
      if (width !== size.width || height !== size.height) size = { width, height }
    })
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }

  $effect(() => observeSize(element))

  return {
    get width() {
      return unit ? `${size.width}px` : size.width
    },
    get height() {
      return unit ? `${size.height}px` : size.height
    },
  }
}
