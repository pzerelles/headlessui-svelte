<script lang="ts">
  import { getContext, type Snippet } from "svelte"
  import type { FormFieldsContext } from "./FormFieldsProvider.svelte"
  import Portal from "./Portal.svelte"

  const { children }: { children: Snippet } = $props()
  const formFieldsContext = getContext<FormFieldsContext>("FormFieldsContext")
</script>

{#if !formFieldsContext}
  {@render children()}
{:else if formFieldsContext.target}
  <Portal target={formFieldsContext.target}>{@render children()}</Portal>
{/if}
