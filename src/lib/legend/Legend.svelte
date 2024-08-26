<script lang="ts" module>
  import { Label, type LabelProps } from "$lib/index.js"
  import type { ElementType, Props } from "$lib/utils/types.js"
  import type { Component } from "svelte"

  const DEFAULT_LEGEND_TAG = Label as Component<LabelProps, any>

  type LegendRenderPropArg = {}
  type LegendPropsWeControl = never

  export type LegendProps<TTag extends ElementType = typeof DEFAULT_LEGEND_TAG> = Props<
    TTag,
    LegendRenderPropArg,
    LegendPropsWeControl,
    {}
  >
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_LEGEND_TAG">
  let { ...props }: { as?: TTag } & LegendProps<TTag> = $props()
</script>

<Label as="div" {...props} />
