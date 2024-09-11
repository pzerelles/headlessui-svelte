<script lang="ts" module>
  import type { Snippet } from "svelte"

  export interface FloatingNodeProps {
    children?: Snippet
    id: string
  }
</script>

<script lang="ts">
  /**
   * Provides parent node context for nested floating elements.
   * @see https://floating-ui.com/docs/FloatingTree
   */
  import { setContext } from "svelte"
  import type { FloatingNodeType } from "../types.js"
  import { useFloatingParentNodeId } from "./FloatingTree.svelte"

  const { children, id }: FloatingNodeProps = $props()

  const parentId = useFloatingParentNodeId()
  setContext<FloatingNodeType>("FloatingNodeContext", {
    get id() {
      return id
    },
    get parentId() {
      return parentId.value
    },
  })
</script>

{#if children}{@render children()}{/if}
