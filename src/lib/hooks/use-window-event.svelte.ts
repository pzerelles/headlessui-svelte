export function useWindowEvent<TType extends keyof WindowEventMap>(params: {
  enabled: boolean
  type: TType
  listener: (ev: WindowEventMap[TType]) => any
  options?: boolean | AddEventListenerOptions
}) {
  let { enabled, type, listener, options } = $derived(params)

  $effect(() => {
    if (!enabled) return

    function handler(event: WindowEventMap[TType]) {
      listener(event)
    }

    window.addEventListener(type, handler, options)
    return () => window.removeEventListener(type, handler, options)
  })
}
