<script lang="ts">
  import * as Headless from "$lib/index.js"
  import { XMarkIcon } from "@pzerelles/heroicons-svelte/20/solid"
  import type { Snippet } from "svelte"

  let { open, close, children }: { open: boolean; close: () => void; children: Snippet } = $props()
</script>

<Headless.Dialog {open} onclose={close}>
  <Headless.DialogBackdrop
    transition
    class="fixed inset-0 bg-black/30 transition data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
  />
  <Headless.DialogPanel
    transition
    class="fixed inset-y-0 w-full max-w-80 p-2 transition duration-300 ease-in-out data-closed:-translate-x-full"
  >
    <div
      class="flex h-full flex-col rounded-lg bg-white shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10"
    >
      <div class="-mb-3 px-4 pt-3">
        <Headless.CloseButton>
          <XMarkIcon />
        </Headless.CloseButton>
      </div>
      {@render children()}
    </div>
  </Headless.DialogPanel>
</Headless.Dialog>
