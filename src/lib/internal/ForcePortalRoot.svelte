<script lang="ts">
  import type { Snippet } from "svelte"
  import { createPortalRoot } from "./portal-force-root.svelte.js"

  let { force, children }: { force: boolean; children: Snippet } = $props()

  createPortalRoot({
    get force() {
      return force
    },
  })
</script>

{#if children}{@render children()}{/if}
