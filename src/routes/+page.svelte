<script lang="ts">
  import Checkbox from "$lib/checkbox/Checkbox.svelte"
  import Description from "$lib/description/Description.svelte"
  import Field from "$lib/field/Field.svelte"
  import Label from "$lib/label/Label.svelte"

  let disabled = $state(true)
</script>

<div class="flex h-screen w-screen items-center justify-center">
  <button onclick={() => (disabled = !disabled)}>Test</button>
  <Field class="border border-black p-8 disabled:bg-gray-400" {disabled}>
    <Label class="data-[disabled]:text-gray-400">Enable beta features</Label>
    <Description>This will give you early access to new features we're developing.</Description>
    <Checkbox
      name="test"
      class="h-6 w-6 border border-black text-center data-[active]:border-red-500 data-[checked]:bg-red-500 data-[hover]:bg-gray-300 data-[hover]:data-[checked]:bg-red-500 data-[disabled]:opacity-25 data-[focus]:ring-2 data-[focus]:ring-green-500"
    >
      {#snippet children({ checked })}
        {checked ? "X" : "O"}
      {/snippet}
    </Checkbox>
  </Field>
  {disabled}
</div>
