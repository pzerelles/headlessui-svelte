<script lang="ts" context="module">
  import type { ElementType, Props } from "$lib/utils/types.js"

  const DEFAULT_GROUP_TAG = "svelte:fragment"
  type GroupRenderPropArg = {}
  type GroupPropsWeControl = never

  export type PortalGroupContext = {
    readonly element: HTMLElement | null
  }

  export type PortalGroupProps<TTag extends ElementType = typeof DEFAULT_GROUP_TAG> = Props<
    TTag,
    GroupRenderPropArg,
    GroupPropsWeControl,
    {
      target: HTMLElement | null
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType">
  import { setContext } from "svelte"

  let { as = DEFAULT_GROUP_TAG as TTag, target, children, ...theirProps }: PortalGroupProps<TTag> = $props()

  setContext("PortalGroupContext", {
    get target() {
      return target
    },
  })
</script>

<svelte:element this={as} {...theirProps}>
  {#if children}{@render children({})}{/if}
</svelte:element>
