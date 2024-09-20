<script>
  import Button from "$lib/button/Button.svelte"
</script>

<div class="relative min-h-full bg-black antialiased">
  <div class="relative bg-white/5">
    <div class="absolute inset-[35%] block rounded-full bg-white/5 blur-2xl"></div>
    <div class="relative flex min-h-screen w-full flex-col items-center justify-center gap-8">
      <Button
        class={({ hover }) =>
          `${hover ? "ring-1 ring-red-500" : ""} inline-flex items-center gap-2 rounded-md bg-zinc-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-zinc-600 data-[open]:bg-zinc-700 data-[focus]:outline-1 data-[focus]:outline-white`}
      >
        Save changes
      </Button>
      <Button asChild>
        {#snippet children({ props })}
          <div
            role="button"
            {...props}
            class="inline-flex items-center gap-2 rounded-md bg-zinc-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-zinc-600 data-[open]:bg-zinc-700 data-[focus]:outline-1 data-[focus]:outline-white"
          >
            Save changes
          </div>
        {/snippet}
      </Button>
    </div>
  </div>
</div>
