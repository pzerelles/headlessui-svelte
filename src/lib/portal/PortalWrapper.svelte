<script lang="ts">
  import { setContext, type Snippet } from "svelte"
  import type { PortalParentContext } from "$lib/portal/InternalPortal.svelte"

  const { context, children }: { context: PortalParentContext; children: Snippet } = $props()

  setContext("PortalParentContext", (() => context)())
</script>

{@render children()}
