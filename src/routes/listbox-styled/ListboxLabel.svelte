<script lang="ts">
  import clsx from "clsx"
  import type { SvelteHTMLElements } from "svelte/elements"

  let { class: className, children, ...props }: SvelteHTMLElements["span"] = $props()
</script>

<span {...props} class={clsx(className, "ml-2.5 truncate first:ml-0 sm:ml-2 sm:first:ml-0")}>
  {#if children}{@render children()}{/if}
</span>
