<script lang="ts">
  import Listbox from "./Listbox.svelte"
  import ListboxLabel from "./ListboxLabel.svelte"
  import ListboxOption from "./ListboxOption.svelte"

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
  <div class="mx-auto h-screen w-52 pt-40">
    <Listbox name="status" defaultValue="active">
      <ListboxOption value="active">
        <ListboxLabel>Active</ListboxLabel>
      </ListboxOption>
      <ListboxOption value="paused">
        <ListboxLabel>Paused</ListboxLabel>
      </ListboxOption>
      <ListboxOption value="delayed">
        <ListboxLabel>Delayed</ListboxLabel>
      </ListboxOption>
      <ListboxOption value="canceled">
        <ListboxLabel>Canceled</ListboxLabel>
      </ListboxOption>
    </Listbox>
  </div>
</div>
