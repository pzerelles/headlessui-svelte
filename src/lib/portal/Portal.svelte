<script lang="ts">
  import InternalPortal, { type PortalProps } from "./InternalPortal.svelte"

  let { element = $bindable(), enabled = true, ...theirProps }: PortalProps = $props()
</script>

{#if enabled}
  <InternalPortal {...theirProps} bind:element />
{:else}
  {@render theirProps.children?.({})}
{/if}
