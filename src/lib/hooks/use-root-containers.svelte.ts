import { getOwnerDocument } from "../utils/owner.js"

export { default as MainTreeProvider, useMainTreeNode } from "../internal/MainTreeProvider.svelte"

export function useRootContainers(
  options: {
    defaultContainers?: (HTMLElement | undefined | null)[]
    portals?: HTMLElement[]
    mainTreeNode?: HTMLElement | undefined | null
  } = {}
) {
  const {
    defaultContainers = [],
    portals,

    // Reference to a node in the "main" tree, not in the portalled Dialog tree.
    mainTreeNode,
  } = $derived(options)

  const ownerDocument = $derived(getOwnerDocument(mainTreeNode))

  const resolvedContainers = $derived.by(() => {
    const containers: HTMLElement[] = []

    // Resolve default containers
    for (const container of defaultContainers) {
      if (!container) continue
      containers.push(container)
    }

    // Resolve portal containers
    if (portals) {
      for (const portal of portals) {
        containers.push(portal)
      }
    }

    // Resolve third party (root) containers
    for (const container of ownerDocument?.querySelectorAll("html > *, body > *") ?? []) {
      if (container === document.body) continue // Skip `<body>`
      if (container === document.head) continue // Skip `<head>`
      if (!(container instanceof HTMLElement)) continue // Skip non-HTMLElements
      if (container.id === "headlessui-portal-root") continue // Skip the Headless UI portal root
      if (mainTreeNode) {
        if (container.contains(mainTreeNode)) continue // Skip if it is the main app
        if (container.contains((mainTreeNode?.getRootNode() as ShadowRoot)?.host)) continue // Skip if it is the main app (and the component is inside a shadow root)
      }
      if (containers.some((defaultContainer) => container.contains(defaultContainer))) continue // Skip if the current container is part of a container we've already seen (e.g.: default container / portal)

      containers.push(container)
    }

    return containers
  })

  return {
    get resolvedContainers() {
      return resolvedContainers
    },
    contains: (element: HTMLElement) => resolvedContainers.some((container) => container.contains(element)),
  }
}
