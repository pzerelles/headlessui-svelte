<script lang="ts">
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

  const people = [
    { id: 1, name: "Tom Cook" },
    { id: 2, name: "Wade Cooper" },
    { id: 3, name: "Tanya Fox" },
    { id: 4, name: "Arlene Mccoy" },
    { id: 5, name: "Devon Webb" },
  ]

  let selected: (typeof people)[number] = $state(people[1])
</script>

<div class="flex h-screen w-full justify-center bg-black px-4 pt-24">
  <div class="mx-auto h-screen w-52 pt-20">
    <div class="fixed top-24 w-52 text-right">
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
          <MenuItem class="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-white/10">
            <PencilIcon class="size-4 fill-white/30" />
            Edit
            <kbd class="ml-auto hidden font-sans text-xs text-white/50 group-data-[focus]:inline">⌘E</kbd>
          </MenuItem>
          <MenuItem class="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-white/10">
            <Square2StackIcon class="size-4 fill-white/30" />
            Duplicate
            <kbd class="ml-auto hidden font-sans text-xs text-white/50 group-data-[focus]:inline">⌘D</kbd>
          </MenuItem>
          <div class="my-1 h-px bg-white/5"></div>
          <MenuItem class="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-white/10">
            <ArchiveBoxXMarkIcon class="size-4 fill-white/30" />
            Archive
            <kbd class="ml-auto hidden font-sans text-xs text-white/50 group-data-[focus]:inline">⌘A</kbd>
          </MenuItem>
          <MenuItem class="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-white/10">
            <TrashIcon class="size-4 fill-white/30" />
            Delete
            <kbd class="ml-auto hidden font-sans text-xs text-white/50 group-data-[focus]:inline">⌘D</kbd>
          </MenuItem>
        </MenuItems>
      </Menu>
    </div>
  </div>
</div>
