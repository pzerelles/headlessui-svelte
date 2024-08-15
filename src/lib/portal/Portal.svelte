<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_PORTAL_TAG">
  import type { ElementType } from "$lib/utils/types.js"
  import InternalPortal, { DEFAULT_PORTAL_TAG, type PortalProps } from "./InternalPortal.svelte"

  let { ref = $bindable(), enabled = true, ...theirProps }: PortalProps<TTag> = $props()
</script>

{#if enabled}
  <InternalPortal {...theirProps} bind:ref />
{:else}
  {@render theirProps.children()}
{/if}
