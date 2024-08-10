import { getOwnerDocument } from "$lib/utils/owner.js"

type AcceptNode = (
  node: HTMLElement
) => typeof NodeFilter.FILTER_ACCEPT | typeof NodeFilter.FILTER_SKIP | typeof NodeFilter.FILTER_REJECT

export function useTreeWalker(options: {
  enabled: boolean
  container: HTMLElement | null
  accept: AcceptNode
  walk(node: HTMLElement): void
}) {
  const { enabled, container, accept, walk } = $derived(options)

  $effect(() => {
    if (!container) return
    if (!enabled) return
    const ownerDocument = getOwnerDocument(container)
    if (!ownerDocument) return

    const acceptNode = Object.assign((node: HTMLElement) => accept(node), { acceptNode: accept })
    const walker = ownerDocument.createTreeWalker(
      container,
      NodeFilter.SHOW_ELEMENT,
      acceptNode,
      // @ts-expect-error This `false` is a simple small fix for older browsers
      false
    )

    while (walker.nextNode()) walk(walker.currentNode as HTMLElement)
  })
}
