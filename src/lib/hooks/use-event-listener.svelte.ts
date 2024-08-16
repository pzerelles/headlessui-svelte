export function useEventListener<TType extends keyof WindowEventMap>(params: {
  element: HTMLElement | Document | Window | EventTarget | null | undefined
  type: TType
  listener: (event: WindowEventMap[TType]) => any
  options?: boolean | AddEventListenerOptions
}) {
  let { element = window, type, listener, options } = $derived(params)

  $effect(() => {
    if (!element) return

    function handler(event: WindowEventMap[TType]) {
      listener(event)
    }

    element.addEventListener(type, handler as any, options)
    return () => element.removeEventListener(type, handler as any, options)
  })
}
