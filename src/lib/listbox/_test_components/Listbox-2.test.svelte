<script lang="ts">
  import Listbox from "$lib/listbox/Listbox.svelte"
  import ListboxButton from "$lib/listbox/ListboxButton.svelte"
  import ListboxOption from "$lib/listbox/ListboxOption.svelte"
  import ListboxOptions from "$lib/listbox/ListboxOptions.svelte"
</script>

<Listbox value={undefined} onchange={(x) => console.log(x)}>
  {#snippet children({ open })}
    <ListboxButton>Trigger</ListboxButton>
    {#if open}
      <ListboxOptions>
        <ListboxOption value="a">Option A</ListboxOption>
        <ListboxOption value="b">Option B</ListboxOption>
        <ListboxOption value="c">Option C</ListboxOption>
      </ListboxOptions>
    {/if}
  {/snippet}
</Listbox>
