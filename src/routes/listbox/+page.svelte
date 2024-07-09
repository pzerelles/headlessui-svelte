<script lang="ts">
  import Listbox from "$lib/listbox/Listbox.svelte"
  import ListboxButton from "$lib/listbox/ListboxButton.svelte"
  import ListboxOption from "$lib/listbox/ListboxOption.svelte"
  import ListboxOptions from "$lib/listbox/ListboxOptions.svelte"
  import { CheckIcon, ChevronDownIcon } from "@pzerelles/heroicons-svelte/20/solid"
  import clsx from "clsx"

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
    <Listbox value={selected} onchange={(value) => (selected = value)}>
      <ListboxButton
        class={clsx(
          "relative block w-full rounded-lg bg-white/5 py-1.5 pl-3 pr-8 text-left text-sm/6 text-white",
          "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
        )}
      >
        {selected.name}
        <ChevronDownIcon
          class="group pointer-events-none absolute right-2.5 top-2.5 size-4 fill-white/60"
          aria-hidden="true"
        />
      </ListboxButton>
      <ListboxOptions
        transition
        class={clsx(
          "w-[var(--button-width)] rounded-xl border border-white/5 bg-white/5 p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none",
          "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
        )}
      >
        {#each people as person (person.name)}
          <ListboxOption
            value={person}
            class="group flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-white/10"
          >
            <CheckIcon class="invisible size-4 fill-white group-data-[selected]:visible" />
            <div class="text-sm/6 text-white">{person.name}</div>
          </ListboxOption>
        {/each}
      </ListboxOptions>
    </Listbox>
  </div>
</div>
