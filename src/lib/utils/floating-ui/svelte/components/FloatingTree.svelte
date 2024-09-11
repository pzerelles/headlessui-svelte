<script lang="ts" module>
  import { getContext, type Snippet } from "svelte"
  import { useId } from "../hooks/useId.svelte.js"
  import type { FloatingNodeType, FloatingTreeType, ReferenceType } from "../types.js"
  import { createPubSub } from "../utils/createPubSub.js"
  import type { MutableRefObject } from "$lib/utils/ref.svelte.js"

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
</script>

<script lang="ts">
  /**
   * Provides context for nested floating elements when they are not children of
   * each other on the DOM.
   * This is not necessary in all cases, except when there must be explicit communication between parent and child floating elements. It is necessary for:
   * - The `bubbles` option in the `useDismiss()` Hook
   * - Nested virtual list navigation
   * - Nested floating elements that each open on hover
   * - Custom communication between parent and child floating elements
   * @see https://floating-ui.com/docs/FloatingTree
   */
  import { setContext } from "svelte"

  const { children }: FloatingTreeProps = $props()

  const nodesRef = $state<MutableRefObject<Array<FloatingNodeType>>>({ current: [] })

  const addNode = (node: FloatingNodeType) => {
    nodesRef.current = [...nodesRef.current, node]
  }

  const removeNode = (node: FloatingNodeType) => {
    nodesRef.current = nodesRef.current.filter((n) => n !== node)
  }

  const events = createPubSub()

  setContext<FloatingTreeType<ReferenceType>>("FloatingTreeContext", {
    get nodesRef() {
      return nodesRef
    },
    addNode,
    removeNode,
    events,
  })
</script>

{#if children}{@render children()}{/if}
