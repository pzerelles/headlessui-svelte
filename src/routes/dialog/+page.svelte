<script lang="ts">
  import Button from "$lib/button/Button.svelte"
  import Dialog from "$lib/dialog/Dialog.svelte"
  import DialogPanel from "$lib/dialog/DialogPanel.svelte"
  import DialogTitle from "$lib/dialog/DialogTitle.svelte"
  import Menu from "$lib/menu/Menu.svelte"
  import MenuButton from "$lib/menu/MenuButton.svelte"
  import MenuItem from "$lib/menu/MenuItem.svelte"
  import MenuItems from "$lib/menu/MenuItems.svelte"
  import {
    ArchiveBoxXMarkIcon,
    ChevronDownIcon,
    PencilIcon,
    Square2StackIcon,
    TrashIcon,
  } from "@pzerelles/heroicons-svelte/16/solid"

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

      <Dialog {open} class="relative z-10 focus:outline-none" onclose={close}>
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
              <Menu>
                <MenuButton
                  class="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-700 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
                >
                  Options
                  <ChevronDownIcon class="size-4 fill-white/60" />
                </MenuButton>

                <MenuItems
                  transition
                  anchor="bottom end"
                  class="w-52 origin-top-right rounded-xl border border-white/5 bg-white/5 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:4px] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
                >
                  <MenuItem
                    as="button"
                    class="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-white/10"
                  >
                    <PencilIcon class="size-4 fill-white/30" />
                    Edit
                    <kbd class="ml-auto hidden font-sans text-xs text-white/50 group-data-[focus]:inline">⌘E</kbd>
                  </MenuItem>
                  <MenuItem
                    as="button"
                    class="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-white/10"
                  >
                    <Square2StackIcon class="size-4 fill-white/30" />
                    Duplicate
                    <kbd class="ml-auto hidden font-sans text-xs text-white/50 group-data-[focus]:inline">⌘D</kbd>
                  </MenuItem>
                  <div class="my-1 h-px bg-white/5"></div>
                  <MenuItem
                    as="button"
                    class="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-white/10"
                  >
                    <ArchiveBoxXMarkIcon class="size-4 fill-white/30" />
                    Archive
                    <kbd class="ml-auto hidden font-sans text-xs text-white/50 group-data-[focus]:inline">⌘A</kbd>
                  </MenuItem>
                  <MenuItem
                    as="button"
                    class="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-white/10"
                  >
                    <TrashIcon class="size-4 fill-white/30" />
                    Delete
                    <kbd class="ml-auto hidden font-sans text-xs text-white/50 group-data-[focus]:inline">⌘D</kbd>
                  </MenuItem>
                </MenuItems>
              </Menu>
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
