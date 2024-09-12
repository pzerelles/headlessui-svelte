<script lang="ts">
  import clsx from "clsx"
  import type { SvelteHTMLElements } from "svelte/elements"

  let { class: className, children, ...props }: SvelteHTMLElements["span"] = $props()
</script>

<span
  {...props}
  class={clsx(
    className,
    "flex flex-1 overflow-hidden text-zinc-500 before:w-2 before:min-w-0 before:shrink group-data-[focus]/option:text-white dark:text-zinc-400"
  )}
>
  <span class="flex-1 truncate"
    >{#if children}{@render children()}{/if}</span
  >
</span>
