<script lang="ts">
  import { getContext, type Snippet } from "svelte"
  import Portal from "./Portal.svelte"

  let { children }: { children: Snippet } = $props()

  const formFieldsContext = getContext<{ target?: HTMLElement }>("FormFieldsContext")
</script>

{#if !formFieldsContext}
  {@render children()}
{:else if formFieldsContext.target}
  <Portal target={formFieldsContext.target}>{@render children()}</Portal>
{/if}
