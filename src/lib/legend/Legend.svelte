<script lang="ts" module>
  import { Label } from "$lib/index.js"
  import type { Props } from "$lib/utils/types.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  const DEFAULT_LEGEND_TAG = "div" as const

  export type LegendProps = Props<typeof DEFAULT_LEGEND_TAG, SvelteHTMLElements[typeof DEFAULT_LEGEND_TAG]>
</script>

<script lang="ts">
  let { ...props }: LegendProps = $props()
</script>

<Label as={DEFAULT_LEGEND_TAG} {...props} />
