<script lang="ts" module>
  import { getContext, onMount } from "svelte"

  type MainTreeContext = { node: HTMLElement | null }

  /**
   * Get the main tree node from context or fallback to the optionally provided node.
   */
  export function useMainTreeNode(options: { fallbackMainTreeNode?: HTMLElement | null } = {}) {
    const { fallbackMainTreeNode = null } = $derived(options)

    // Prefer the main tree node from context, but fallback to the provided node.
    return (
      getContext<MainTreeContext>("MainTreeContext") ?? {
        get node() {
          return fallbackMainTreeNode
        },
      }
    )
  }
</script>

<script lang="ts">
  import { setContext, type Snippet } from "svelte"
  import Hidden, { HiddenFeatures } from "./Hidden.svelte"
  import { getOwnerDocument } from "../utils/owner.js"
  /**
   * A provider for the main tree node.
   *
   * When a component is rendered in a `Portal`, it is no longer part of the main
   * tree. This provider helps to find the main tree node and pass it along to the
   * components that need it.
   *
   * The main tree node is used for features such as outside click behavior, where
   * we allow clicks in 3rd party containers, but not in the parent of the "main
   * tree".
   *
   * In case of a `Popover`, we can use the `PopoverButton` as a marker in the
   * "main tree", the `PopoverPanel` can't be used because it could be rendered in
   * a `Portal` (e.g. when using the `anchor` props).
   *
   * However, we can't use the `PopoverButton` when it's nested inside of another
   * `Popover`'s `PopoverPanel` component if the parent `PopoverPanel` is
   * rendered in a `Portal`.
   *
   * This is where the `MainTreeProvider` comes in. It will find the "main tree"
   * node and pass it on. The top-level `PopoverButton` will be used as a marker
   * in the "main tree" and nested `Popover` will use this button as well.
   */
  let { node, children }: { children: Snippet; node?: HTMLElement | null } = $props()

  let mainTreeNode = $state<HTMLElement | null>(null)

  // 1. Prefer the main tree node from context
  // 2. Prefer the provided node
  // 3. Create a new node at this point, and find the main tree node
  const resolvedMainTreeNode = useMainTreeNode({
    get fallbackMainTreeNode() {
      return node ?? mainTreeNode
    },
  })

  setContext("MainTreeContext", {
    get node() {
      return resolvedMainTreeNode.node
    },
  })

  /**
   * If no main tree node is found at this point, then we briefly render an
   * element to find the main tree node and pass it along.
   */
  let el = $state<HTMLElement>()
  onMount(() => {
    if (!el) return

    // We will only render this when no `mainTreeNode` is found. This
    // means that if we render this element and use it as the
    // `mainTreeNode` that we will be unmounting it later.
    //
    // However, we can resolve the actual root container of the main
    // tree node and use that instead.
    for (let container of getOwnerDocument(el)?.querySelectorAll("html > *, body > *") ?? []) {
      if (container === document.body) continue // Skip `<body>`
      if (container === document.head) continue // Skip `<head>`
      if (!(container instanceof HTMLElement)) continue // Skip non-HTMLElements
      if (container?.contains(el)) {
        mainTreeNode = container
        break
      }
    }
  })
</script>

{#if children}{@render children()}{/if}
{#if resolvedMainTreeNode === null}
  <Hidden features={HiddenFeatures.Hidden} bind:element={el} />
{/if}
