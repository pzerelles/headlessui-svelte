<script lang="ts" module>
  import { Label } from "$lib/index.js"
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_LEGEND_TAG = "div" as const

  type LegendRenderPropArg = {}
  type LegendPropsWeControl = never

  export type LegendProps = Props<typeof DEFAULT_LEGEND_TAG, LegendRenderPropArg, LegendPropsWeControl, {}>
</script>

<script lang="ts">
  let { ...props }: LegendProps = $props()
</script>

<Label as="div" {...props} />
