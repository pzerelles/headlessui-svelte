<script lang="ts" module>
  import type { Snippet } from "svelte"
  import type { ElementType, Props } from "$lib/utils/types.js"

  const DEFAULT_SEPARATOR_TAG = "div" as const
  type SeparatorRenderPropArg = {}
  type SeparatorPropsWeControl = "role"

  export type MenuSeparatorProps<TTag extends ElementType = typeof DEFAULT_SEPARATOR_TAG> = Props<
    TTag,
    SeparatorRenderPropArg,
    SeparatorPropsWeControl
  >

  export type MenuSeparatorChildren = Snippet<[SeparatorRenderPropArg]>
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_SEPARATOR_TAG">
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  let { ref = $bindable(), ...theirProps }: { as?: TTag } & MenuSeparatorProps<TTag> = $props()
  const ourProps = { role: "separator" }
</script>

<ElementOrComponent {ourProps} {theirProps} defaultTag={DEFAULT_SEPARATOR_TAG} name="MenuSeparator" bind:ref />
