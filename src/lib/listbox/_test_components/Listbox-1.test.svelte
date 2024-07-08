<script lang="ts">
  import Listbox from "../Listbox.svelte"
  import ListboxButton from "../ListboxButton.svelte"
  import ListboxOption from "../ListboxOption.svelte"
  import ListboxOptions from "../ListboxOptions.svelte"
</script>

<Listbox value={undefined} onchange={(x) => console.log(x)}>
  <ListboxButton>Trigger</ListboxButton>
  <ListboxOptions>
    <ListboxOption value="a">Option A</ListboxOption>
    <ListboxOption value="b">Option B</ListboxOption>
    <ListboxOption value="c">Option C</ListboxOption>
  </ListboxOptions>
</Listbox>
