<script lang="ts" module>
  import { Label } from "$lib/index.js"
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_LEGEND_TAG = "div" as const

  export type LegendOwnProps = {
    element?: HTMLElement
    class?: string
  }

  export type LegendProps = Props<typeof DEFAULT_LEGEND_TAG, {}, LegendOwnProps>
</script>

<script lang="ts">
  let { asChild, children: theirChildren, ...props }: LegendProps = $props()
</script>

<Label asChild>
  {#snippet children({ props: childProps })}
    {#if asChild}
      {@render theirChildren?.({ props: { ...props, ...childProps } })}
    {:else}
      <div {...props} {...childProps}>
        {@render theirChildren?.({ props: {} })}
      </div>
    {/if}
  {/snippet}
</Label>
