import { disposables } from "../utils/disposables.js"

/**
 * A hook to ensure that a callback is called when the element has disappeared
 * from the screen.
 *
 * This can happen if you use Tailwind classes like: `hidden md:block`, once the
 * viewport is smaller than `md` the element will disappear.
 */
export function useOnDisappear(options: {
  enabled: boolean
  ref: HTMLElement | null | undefined
  ondisappear: () => void
}) {
  const { enabled, ref, ondisappear } = $derived(options)
  let listenerRef = (element: HTMLElement) => {
    let rect = element.getBoundingClientRect()
    if (rect.x === 0 && rect.y === 0 && rect.width === 0 && rect.height === 0) {
      ondisappear()
    }
  }

  $effect(() => {
    if (!enabled) return

    const element = ref
    if (!element) return

    let d = disposables()

    // Try using ResizeObserver
    if (typeof ResizeObserver !== "undefined") {
      let observer = new ResizeObserver(() => listenerRef(element))
      observer.observe(element)
      d.add(() => observer.disconnect())
    }

    // Try using IntersectionObserver
    if (typeof IntersectionObserver !== "undefined") {
      let observer = new IntersectionObserver(() => listenerRef(element))
      observer.observe(element)
      d.add(() => observer.disconnect())
    }

    return () => d.dispose()
  })
}
