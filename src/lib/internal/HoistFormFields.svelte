<script lang="ts">
  import { getContext, type Snippet } from "svelte"
  import type { FormFieldsContext } from "$lib/internal/FormFieldsProvider.svelte"
  import Portal from "$lib/internal/Portal.svelte"

  const { children }: { children: Snippet } = $props()
  const formFieldsContext = getContext<FormFieldsContext>("FormFieldsContext")
</script>

{#if !formFieldsContext}
  {@render children()}
{:else if formFieldsContext.target}
  <Portal target={formFieldsContext.target}>{@render children()}</Portal>
{/if}
