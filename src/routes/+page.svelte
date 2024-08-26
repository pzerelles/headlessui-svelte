<script lang="ts">
  import Checkbox from "$lib/checkbox/Checkbox.svelte"
  import Description from "$lib/description/Description.svelte"
  import Field from "$lib/field/Field.svelte"
  import Label from "$lib/label/Label.svelte"
  import Button from "$lib/button/Button.svelte"
  import { CheckIcon } from "@pzerelles/heroicons-svelte/24/outline"

  let disabled = $state(true)
  let checked = $state(false)

  $inspect(checked)
</script>

<div class="flex h-screen w-screen items-center justify-center gap-4">
  <Button
    class="rounded bg-sky-600 px-4 py-2 text-sm text-white data-[hover]:bg-sky-500 data-[hover]:data-[active]:bg-sky-700"
    onclick={() => (disabled = !disabled)}
  >
    Enable / Disable
  </Button>
  <Field class="border border-black p-8 disabled:bg-gray-400" {disabled}>
    <Label class="data-[disabled]:text-gray-400">Enable beta features</Label>
    <Description>This will give you early access to new features we're developing.</Description>
    <Checkbox
      name="test"
      bind:checked
      class="group block size-4 rounded border bg-white data-[disabled]:cursor-not-allowed data-[checked]:bg-blue-500 data-[checked]:data-[disabled]:bg-gray-500 data-[disabled]:opacity-50"
    >
      <CheckIcon class="size-3.5 stroke-white stroke-2 opacity-0 group-data-[checked]:opacity-100" />
    </Checkbox>
  </Field>
  {disabled}
</div>
