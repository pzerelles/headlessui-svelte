<script lang="ts">
  import Checkbox from "$lib/checkbox/Checkbox.svelte"
  import Description from "$lib/description/Description.svelte"
  import Field from "$lib/field/Field.svelte"
  import Label from "$lib/label/Label.svelte"
  import Button from "$lib/button/Button.svelte"
  import { CheckIcon } from "@pzerelles/heroicons-svelte/24/outline"
  import Switch from "$lib/switch/Switch.svelte"
  import DisabledProvider from "$lib/utils/DisabledProvider.svelte"

  let disabled = $state(true)
  let checked = $state(true)

  let buttonElement = $state<HTMLButtonElement>()
</script>

<div class="flex h-screen w-screen items-center justify-center gap-4">
  <Button
    class="rounded bg-sky-600 px-4 py-2 text-sm text-white data-[hover]:bg-sky-500 data-[hover]:data-[active]:bg-sky-700"
    onclick={() => (disabled = !disabled)}
    bind:element={buttonElement}
  >
    Enable / Disable
  </Button>
  <Button
    class="rounded bg-sky-600 px-4 py-2 text-sm text-white data-[hover]:bg-sky-500 data-[hover]:data-[active]:bg-sky-700"
    onclick={() => (checked = !checked)}>Toggle</Button
  >
  <div class="flex flex-col gap-4">
    <DisabledProvider {disabled}>
      <Field class="border border-black p-8 disabled:bg-gray-400">
        <Label class="data-[disabled]:text-gray-400">Enable beta features (bind)</Label>
        <Description>This will give you early access to new features we're developing.</Description>
        <Checkbox
          name="test"
          bind:checked
          class="group block size-4 rounded border bg-white data-[disabled]:cursor-not-allowed data-[checked]:bg-blue-500 data-[checked]:data-[disabled]:bg-gray-500 data-[disabled]:opacity-50"
        >
          <CheckIcon class="size-3.5 stroke-white stroke-2 opacity-0 group-data-[checked]:opacity-100" />
        </Checkbox>
      </Field>
      <Field class="border border-black p-8 disabled:bg-gray-400">
        <Label class="data-[disabled]:text-gray-400">Enable beta features (controlled)</Label>
        <Description>This will give you early access to new features we're developing.</Description>
        <Checkbox
          name="test"
          {checked}
          onchange={(value) => {}}
          class="group block size-4 rounded border bg-white data-[disabled]:cursor-not-allowed data-[checked]:bg-blue-500 data-[checked]:data-[disabled]:bg-gray-500 data-[disabled]:opacity-50"
        >
          <CheckIcon class="size-3.5 stroke-white stroke-2 opacity-0 group-data-[checked]:opacity-100" />
        </Checkbox>
      </Field>
      <Field class="border border-black bg-gray-200 p-8 disabled:bg-gray-400">
        <Label class="data-[disabled]:text-gray-400">Enable beta features (bind)</Label>
        <Description>This will give you early access to new features we're developing.</Description>
        <Switch
          name="test"
          bind:checked
          class="group relative flex h-7 w-14 cursor-pointer rounded-full bg-white/10 p-1 outline outline-gray-400 transition-colors duration-200 ease-in-out focus:outline-none data-[checked]:bg-white/10 data-[focus]:outline-1 data-[focus]:outline-white"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-7"
          ></span>
        </Switch>
      </Field>
      <Field class="border border-black bg-gray-200 p-8 disabled:bg-gray-400">
        <Label class="data-[disabled]:text-gray-400">Enable beta features (controlled)</Label>
        <Description>This will give you early access to new features we're developing.</Description>
        <Switch
          name="test"
          {checked}
          onchange={(value) => {}}
          class="group relative flex h-7 w-14 cursor-pointer rounded-full bg-white/10 p-1 outline outline-gray-400 transition-colors duration-200 ease-in-out focus:outline-none data-[checked]:bg-white/10 data-[focus]:outline-1 data-[focus]:outline-white"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-7"
          ></span>
        </Switch>
      </Field>
    </DisabledProvider>
  </div>
  {disabled}
</div>
