<script lang="ts">
  import Legend from "$lib/legend/Legend.svelte"
  import Field from "$lib/field/Field.svelte"
  import Label from "$lib/label/Label.svelte"
  import Input from "$lib/input/Input.svelte"
  import Description from "$lib/description/Description.svelte"
  import Select from "$lib/select/Select.svelte"
  import Textarea from "$lib/textarea/Textarea.svelte"
  import Listbox from "$lib/listbox/Listbox.svelte"
  import { ChevronDownIcon, CheckIcon } from "@pzerelles/heroicons-svelte/16/solid"
  import Fieldset from "$lib/fieldset/Fieldset.svelte"
  import ListboxButton from "$lib/listbox/ListboxButton.svelte"
  import ListboxOptions from "$lib/listbox/ListboxOptions.svelte"
  import ListboxOption from "$lib/listbox/ListboxOption.svelte"

  const people = [
    { id: 1, name: "Durward Reynolds" },
    { id: 2, name: "Kenton Towne" },
    { id: 3, name: "Therese Wunsch" },
    { id: 4, name: "Benedict Kessler" },
    { id: 5, name: "Katelyn Rohan" },
  ]
  let selected = $state(people[1].id)
  const setSelected = (value: number) => (selected = value)
</script>

<div class="flex h-screen w-full justify-center bg-black px-4 pt-24">
  <div class="mx-auto h-screen">
    <div class="w-full max-w-lg px-4">
      <Fieldset class="space-y-6 rounded-xl bg-white/5 p-6 sm:p-10">
        <Legend class="text-base/7 font-semibold text-white">Shipping details</Legend>
        <Field>
          <Label class="text-sm/6 font-medium text-white">Street address</Label>
          <Input
            class={[
              "mt-3 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white",
              "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
            ]}
          />
        </Field>
        <Field>
          <Label class="text-sm/6 font-medium text-white">Country</Label>
          <Description class="text-sm/6 text-white/50">We currently only ship to North America.</Description>
          <div class="relative">
            <Select
              class={[
                "mt-3 block w-full appearance-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white",
                "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
                // Make the text of each option black on Windows
                "*:text-black",
              ]}
            >
              <option>Canada</option>
              <option>Mexico</option>
              <option>United States</option>
            </Select>
            <ChevronDownIcon
              class="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
              aria-hidden="true"
            />
          </div>
        </Field>
        <Field>
          <Label class="text-sm/6 font-medium text-white">Country</Label>
          <Description class="text-sm/6 text-white/50">We currently only ship to North America.</Description>
          <Listbox value={selected} onchange={setSelected} name="person">
            <ListboxButton
              class={[
                "relative mt-3 block w-full rounded-lg bg-white/5 py-1.5 pr-8 pl-3 text-left text-sm/6 text-white",
                "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
              ]}
            >
              {people.find(({ id }) => id === selected)?.name}
              <ChevronDownIcon
                class="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                aria-hidden="true"
              />
            </ListboxButton>
            <ListboxOptions
              anchor="bottom"
              transition
              class={[
                "w-[var(--button-width)] rounded-xl border border-gray-950 bg-gray-950 p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none",
                "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0",
              ]}
            >
              {#each people as person (person.id)}
                <ListboxOption
                  value={person.id}
                  class="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none data-[focus]:bg-white/10"
                >
                  <CheckIcon class="invisible size-4 fill-white group-data-[selected]:visible" />
                  <div class="text-sm/6 text-white">{person.name}</div>
                </ListboxOption>
              {/each}
            </ListboxOptions>
          </Listbox>
        </Field>
        <Field>
          <Label class="text-sm/6 font-medium text-white">Delivery notes</Label>
          <Description class="text-sm/6 text-white/50">If you have a tiger, we'd like to know about it.</Description>
          <Textarea
            class={[
              "mt-3 block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white",
              "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
            ]}
            rows={3}
          />
        </Field>
      </Fieldset>
    </div>
  </div>
</div>
