<script lang="ts" context="module">
  import type { ElementType, Props } from "$lib/utils/types.js"

  const DEFAULT_GROUP_TAG = "svelte:fragment"
  type GroupRenderPropArg = {}
  type GroupPropsWeControl = never

  export type PortalGroupContext = {
    readonly target: HTMLElement | null
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
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { setContext } from "svelte"

  let { ref = $bindable(), target, ...theirProps }: { as?: TTag } & PortalGroupProps<TTag> = $props()

  setContext("PortalGroupContext", {
    get target() {
      return target
    },
  })
</script>

<ElementOrComponent {theirProps} defaultTag={DEFAULT_GROUP_TAG} name="PortalGroup" bind:ref />
