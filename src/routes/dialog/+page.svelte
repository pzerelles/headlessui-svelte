<script lang="ts">
  import Button from "$lib/button/Button.svelte"
  import Dialog from "$lib/dialog/Dialog.svelte"
  import DialogPanel from "$lib/dialog/DialogPanel.svelte"
  import DialogTitle from "$lib/dialog/DialogTitle.svelte"

  let open = $state(false)

  const close = () => (open = false)
</script>

<div class="flex h-screen w-full justify-center bg-black px-4 pt-24">
  <div class="mx-auto h-screen w-52 pt-20">
    <div class="fixed top-24 w-52 text-right">
      <Button
        onclick={() => (open = true)}
        class="rounded-md bg-black/20 px-4 py-2 text-sm font-medium text-white focus:outline-none data-[hover]:bg-black/30 data-[focus]:outline-1 data-[focus]:outline-white"
      >
        Open dialog
      </Button>

      <Dialog {open} class="relative z-10 focus:outline-none" onClose={close}>
        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              class="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-500 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
            >
              <DialogTitle as="h3" class="text-base/7 font-medium text-white">Payment successful</DialogTitle>
              <p class="mt-2 text-sm/6 text-white/50">
                Your payment has been successfully submitted. We’ve sent you an email with all of the details of your
                order.
              </p>
              <div class="mt-4">
                <Button
                  class="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
                  onclick={close}
                >
                  Got it, thanks!
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  </div>
</div>
