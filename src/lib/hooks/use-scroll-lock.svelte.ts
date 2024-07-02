import { useDocumentOverflowLockedEffect } from "./document-overflow/use-document-overflow.svelte.js"
import { useIsTopLayer } from "./use-is-top-layer.svelte.js"

export function useScrollLock(options: {
  enabled: boolean
  ownerDocument: Document | null
  resolveAllowedContainers?: () => HTMLElement[]
}) {
  const { enabled, ownerDocument, resolveAllowedContainers = () => [document.body] } = $derived(options)
  const isTopLayer = useIsTopLayer({
    get enabled() {
      return enabled
    },
    scope: "scroll-lock",
  })

  useDocumentOverflowLockedEffect({
    get shouldBeLocked() {
      return isTopLayer.value
    },
    get doc() {
      return ownerDocument
    },
    get meta() {
      return (meta: Record<string, any>) => ({
        containers: [...(meta.containers ?? []), resolveAllowedContainers()],
      })
    },
  })
}
