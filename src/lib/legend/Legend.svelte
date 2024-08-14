<script lang="ts" context="module">
  import type { ElementType, Props } from "$lib/utils/types.js"
  let DEFAULT_LEGEND_TAG = Label

  type LegendRenderPropArg = {}
  type LegendPropsWeControl = never

  export type LegendProps<TTag extends ElementType = typeof DEFAULT_LEGEND_TAG> = Props<
    TTag,
    LegendRenderPropArg,
    LegendPropsWeControl,
    {}
  >
</script>

<script lang="ts" generics="TTag extends ElementType">
  import Label from "../label/Label.svelte"

  let { ...props }: { as?: TTag } & LegendProps<TTag> = $props()
</script>

<Label as="div" {...props} />
