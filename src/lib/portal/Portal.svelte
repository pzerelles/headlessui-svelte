<script lang="ts" generics="TTag extends ElementType = undefined">
  import type { ElementType } from "../utils/types.js"
  import type { Component } from "svelte"
  import InternalPortal, { type PortalProps } from "./InternalPortal.svelte"

  let { element = $bindable(), enabled = true, ...theirProps }: PortalProps<TTag> = $props()

  const InternalPortalComponent = InternalPortal as Component<typeof theirProps, any>
</script>

{#if enabled}
  <InternalPortalComponent {...theirProps} bind:element />
{:else if theirProps.children}{@render theirProps.children({})}{/if}
