<script lang="ts">
  import Listbox, { type ListboxProps } from "$lib/listbox/Listbox.svelte"
  import ListboxButton from "$lib/listbox/ListboxButton.svelte"
  import ListboxOption, { type ListboxOptionProps } from "$lib/listbox/ListboxOption.svelte"
  import ListboxOptions from "$lib/listbox/ListboxOptions.svelte"
  import ListboxSelectedOption from "$lib/listbox/ListboxSelectedOption.svelte"
  import { CheckIcon, ChevronDownIcon } from "@pzerelles/heroicons-svelte/20/solid"
  import clsx from "clsx"
  import type { Snippet } from "svelte"

  const people = [
    { id: 1, name: "Tom Cook" },
    { id: 2, name: "Wade Cooper" },
    { id: 3, name: "Tanya Fox" },
    { id: 4, name: "Arlene Mccoy" },
    { id: 5, name: "Devon Webb" },
  ]

  let selected: (typeof people)[number] = $state(people[1])
  let multiSelected: typeof people = $state([people[1]])
</script>

{#snippet myListbox({
  value,
  placeholder: placeholderText,
  children,
  ...props
}: { placeholder?: string; children: Snippet } & ListboxProps<"svelte:fragment", typeof selected>)}
  {#snippet placeholder()}
    <span class="opacity-50">{placeholderText}</span>
  {/snippet}

  <Listbox {value} {...props}>
    <ListboxButton>
      <ListboxSelectedOption options={children} {placeholder} />
    </ListboxButton>
    <ListboxOptions
      transition
      class={clsx(
        "w-full rounded-xl border border-white/5 bg-white/5 p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none",
        "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
      )}>{@render children()}</ListboxOptions
    >
  </Listbox>
{/snippet}

{#snippet myListboxOption({
  children: theirChildren,
  ...props
}: { children: Snippet } & ListboxOptionProps<"svelte:fragment", typeof selected>)}
  <ListboxOption as="svelte:fragment" {...props}>
    {#snippet children({ selectedOption }, props)}
      <div
        {...props}
        class="group flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-white/10"
      >
        {@render theirChildren()}
      </div>
    {/snippet}
  </ListboxOption>
{/snippet}

<div class="flex h-screen w-full justify-center bg-black px-4 pt-24">
  <div class="mx-auto h-screen w-52 pt-40">
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
        anchor="selection"
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

    {#snippet options()}
      {#each people as person (person.name)}
        {#snippet option()}
          <CheckIcon class="invisible size-4 fill-white group-data-[selected]:visible" />
          <div class="text-sm/6 text-white">{person.name}</div>
        {/snippet}
        {@render myListboxOption({ value: person, children: option })}
      {/each}
    {/snippet}

    <!--{@render myListbox({
      value: selected,
      onchange: (value) => (selected = value),
      placeholder: "Select a person&hellip;",
      children: options,
  })}-->
  </div>
</div>
