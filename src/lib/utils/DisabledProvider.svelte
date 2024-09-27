<script lang="ts">
  import { provideDisabled } from "$lib/hooks/use-disabled.js"
  import type { Snippet } from "svelte"

  const { disabled, children }: { disabled?: boolean; children?: Snippet } = $props()

  provideDisabled(() => disabled ?? false)
</script>

{@render children?.()}
