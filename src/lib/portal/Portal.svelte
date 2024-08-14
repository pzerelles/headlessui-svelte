<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_PORTAL_TAG">
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import type { ElementType } from "$lib/utils/types.js"
  import InternalPortal, { DEFAULT_PORTAL_TAG, type PortalProps } from "./InternalPortal.svelte"

  let { ref = $bindable(), enabled = true, ...theirProps }: PortalProps<TTag> = $props()
</script>

{#if enabled}
  <InternalPortal {...theirProps} bind:ref />
{:else}
  <ElementOrComponent {theirProps} defaultTag={DEFAULT_PORTAL_TAG} name="InternalPortal" bind:ref />
{/if}
