import { useEventListener } from "./use-event-listener.svelte.js"
import { useIsTopLayer } from "./use-is-top-layer.svelte.js"

export function useEscape(options: {
  enabled: boolean
  view: typeof document.defaultView | null
  cb: (event: KeyboardEvent) => void
}) {
  const { enabled, view = typeof document !== "undefined" ? document.defaultView : null, cb } = $derived(options)
  let isTopLayer = useIsTopLayer({
    get enabled() {
      return enabled
    },
    scope: "escape",
  })

  useEventListener({
    get element() {
      return view
    },
    type: "keydown",
    listener: (event) => {
      if (!isTopLayer.value) return
      if (event.defaultPrevented) return
      if (event.key !== "Escape") return

      cb(event)
    },
  })
}
