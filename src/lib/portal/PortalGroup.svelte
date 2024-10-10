<script lang="ts" module>
  import type { PropsAsChild } from "$lib/utils/types.js"

  const DEFAULT_GROUP_TAG = "svelte:fragment"
  export type GroupRenderPropArg = {}

  export type PortalGroupContext = {
    readonly target: HTMLElement | null
  }

  export type PortalGroupProps = PropsAsChild<GroupRenderPropArg, { target: HTMLElement | null }>
</script>

<script lang="ts">
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { setContext } from "svelte"

  let { target, ...theirProps }: PortalGroupProps = $props()

  setContext("PortalGroupContext", {
    get target() {
      return target
    },
  })
</script>

<ElementOrComponent {theirProps} name="PortalGroup" />
