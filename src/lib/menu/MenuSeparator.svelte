<script lang="ts" module>
  import type { ElementType, Props } from "$lib/utils/types.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  const DEFAULT_SEPARATOR_TAG = "div" as const
  type SeparatorRenderPropArg = {}
  type SeparatorPropsWeControl = "role"

  export type MenuSeparatorProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_SEPARATOR_TAG],
    SeparatorRenderPropArg,
    SeparatorPropsWeControl
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  let { element = $bindable(), ...theirProps }: MenuSeparatorProps<TTag> = $props()
  const ourProps = { role: "separator" }
</script>

<ElementOrComponent {ourProps} {theirProps} defaultTag={DEFAULT_SEPARATOR_TAG} name="MenuSeparator" bind:element />
