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
  import { createPubSub } from "$lib/utils/floating-ui/svelte/utils/createPubSub.js"
  import type { MutableRefObject } from "$lib/utils/ref.svelte.js"
  import type { FloatingTreeProps } from "$lib/utils/floating-ui/svelte/components/context.svelte.js"
  import type { FloatingNodeType, FloatingTreeType, ReferenceType } from "$lib/utils/floating-ui/svelte/types.js"

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
