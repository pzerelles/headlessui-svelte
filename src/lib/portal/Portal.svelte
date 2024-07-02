<script lang="ts" generics="TTag extends ElementType">
  import type { ElementType } from "$lib/utils/types.js"
  import InternalPortal, { DEFAULT_PORTAL_TAG, type PortalProps } from "./InternalPortal.svelte"

  let { as = DEFAULT_PORTAL_TAG as TTag, enabled = true, children, ...theirProps }: PortalProps<TTag> = $props()
</script>

{#if enabled}
  <InternalPortal {...theirProps} />
{:else}
  <svelte:element this={as} {...theirProps}>
    {#if children}{@render children({})}{/if}
  </svelte:element>
{/if}
