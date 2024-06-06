<script lang="ts" context="module">
  export type LegendProps = SvelteHTMLElements["div"]
</script>

<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements"
  import Label from "../label/Label.svelte"

  let { ...props }: LegendProps = $props()
</script>

<Label as="div" {...props} />
