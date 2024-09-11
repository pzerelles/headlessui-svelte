<script lang="ts" module>
</script>

<script lang="ts">
  import type { Snippet } from "svelte"
  import { useFloatingProvider } from "./floating-provider.svelte.js"

  const { children, enabled = true }: { children: Snippet; enabled?: boolean } = $props()

  useFloatingProvider({
    get enabled() {
      return enabled
    },
  })
</script>

{#if children}{@render children()}{/if}
