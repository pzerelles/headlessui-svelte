import { getContext, type Snippet } from "svelte"
import { useId } from "$lib/utils/floating-ui/svelte/hooks/useId.svelte.js"
import type { FloatingNodeType, FloatingTreeType, ReferenceType } from "$lib/utils/floating-ui/svelte/types.js"

//const FloatingNodeContext = React.createContext<FloatingNodeType | null>(null)
//const FloatingTreeContext = React.createContext<FloatingTreeType | null>(null)

/**
 * Returns the parent node id for nested floating elements, if available.
 * Returns `null` for top-level floating elements.
 */
export const useFloatingParentNodeId = (): { readonly value: string | null } => {
  const context = getContext<FloatingNodeType>("FloatingNodeContext")
  return {
    get value() {
      return context?.id ?? null
    },
  }
}

/**
 * Returns the nearest floating tree context, if available.
 */
export const useFloatingTree = <RT extends ReferenceType = ReferenceType>(): FloatingTreeType<RT> | null =>
  getContext<FloatingTreeType<RT>>("FloatingTreeContext") ?? null

/**
 * Registers a node into the `FloatingTree`, returning its id.
 * @see https://floating-ui.com/docs/FloatingTree
 */
export function useFloatingNodeId(options: { customParentId?: string }): string {
  const { customParentId } = $derived(options)
  const id = useId()
  const tree = useFloatingTree()
  const reactParentId = useFloatingParentNodeId()
  const parentId = $derived(customParentId || reactParentId.value)

  $effect(() => {
    const node = { id, parentId }
    tree?.addNode(node)
    return () => {
      tree?.removeNode(node)
    }
  }) //, [tree, id, parentId])

  return id
}

export interface FloatingTreeProps {
  children?: Snippet
}
