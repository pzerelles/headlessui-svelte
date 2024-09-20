<script lang="ts" generics="T">
  import * as Headless from "$lib/index.js"
  import clsx from "clsx"
  import type { Snippet } from "svelte"

  const {
    children: theirChildren,
    class: className,
    ...theirProps
  }: { class?: string; children: Snippet } & Omit<Headless.ListboxOptionProps<"div", T>, "class"> = $props()

  const sharedClasses = clsx(
    // Base
    "flex min-w-0 items-center",
    // Icons
    "[&>[data-slot=icon]]:size-5 [&>[data-slot=icon]]:shrink-0 sm:[&>[data-slot=icon]]:size-4",
    "[&>[data-slot=icon]]:text-zinc-500 [&>[data-slot=icon]]:group-data-[focus]/option:text-white [&>[data-slot=icon]]:dark:text-zinc-400",
    "forced-colors:[&>[data-slot=icon]]:text-[CanvasText] forced-colors:[&>[data-slot=icon]]:group-data-[focus]/option:text-[Canvas]",
    // Avatars
    "[&>[data-slot=avatar]]:-mx-0.5 [&>[data-slot=avatar]]:size-6 sm:[&>[data-slot=avatar]]:size-5"
  )

  let ref = $state<HTMLElement>()
</script>

<Headless.ListboxOption as="svelte:fragment" {...theirProps} {ref}>
  {#snippet children({ slot: { selectedOption }, props })}
    {#if selectedOption}
      <div bind:this={ref} class={clsx(className, sharedClasses)} {...props}>{@render theirChildren()}</div>
    {:else}
      <div
        bind:this={ref}
        class={clsx(
          // Basic layout
          "group/option grid cursor-default grid-cols-[theme(spacing.5),1fr] items-baseline gap-x-2 rounded-lg py-2.5 pl-2 pr-3.5 sm:grid-cols-[theme(spacing.4),1fr] sm:py-1.5 sm:pl-1.5 sm:pr-3",
          // Typography
          "text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white forced-colors:text-[CanvasText]",
          // Focus
          "outline-none data-[focus]:bg-blue-500 data-[focus]:text-white",
          // Forced colors mode
          "forced-color-adjust-none forced-colors:data-[focus]:bg-[Highlight] forced-colors:data-[focus]:text-[HighlightText]",
          // Disabled
          "data-[disabled]:opacity-50"
        )}
        {...props}
      >
        <svg
          class="relative hidden size-5 self-center stroke-current group-data-[selected]/option:inline sm:size-4"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M4 8.5l3 3L12 4" stroke-width={1.5} stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class={clsx(className, sharedClasses, "col-start-2")}>{@render theirChildren()}</span>
      </div>
    {/if}
  {/snippet}
</Headless.ListboxOption>
