<script lang="ts">
  import type { Snippet } from "svelte"
  import Hidden, { HiddenFeatures } from "./Hidden.svelte"
  import { createFormFieldsContext } from "./form-fields.svelte.js"

  const { children }: { children?: Snippet } = $props()

  const context = createFormFieldsContext()
  const { fields } = $derived(context)
</script>

{#if children}{@render children()}{/if}
<Hidden features={HiddenFeatures.Hidden}>
  {#each fields as field}
    {@render field()}
  {/each}
</Hidden>
