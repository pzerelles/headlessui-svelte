<script lang="ts">
  import type { Snippet } from "svelte"
  import { createPortalRoot } from "./portal-force-root.svelte.js"

  let { force, children }: { force: boolean; children: Snippet } = $props()

  createPortalRoot({ force })
</script>

{#if children}{@render children()}{/if}
