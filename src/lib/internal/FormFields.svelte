<script lang="ts">
  import { disposables } from "../utils/disposables.js"
  import { objectToFormEntries } from "../utils/form.js"
  import FormResolver from "./FormResolver.svelte"
  import HoistFormFields from "./HoistFormFields.svelte"
  import Hidden, { HiddenFeatures } from "./Hidden.svelte"
  import { compact } from "../utils/object.js"

  let {
    data,
    form: formId,
    disabled,
    onReset,
    overrides,
  }: {
    data: Record<string, any>
    overrides?: Record<string, any>
    form?: string
    disabled?: boolean
    onReset?: (e: Event) => void
  } = $props()

  let form = $state<HTMLFormElement | null>(null)
  const d = disposables()

  $effect(() => {
    if (!onReset) return
    if (!form) return

    return d.addEventListener(form, "reset", onReset)
  })
</script>

<HoistFormFields>
  <FormResolver setForm={(value) => (form = value)} {formId} />
  {#each objectToFormEntries(data) as [name, value]}
    <Hidden
      features={HiddenFeatures.Hidden}
      {...compact({
        key: name,
        as: "input",
        type: "hidden",
        hidden: true,
        readOnly: true,
        form: formId,
        disabled,
        name,
        value,
        ...overrides,
      })}
    />
  {/each}
</HoistFormFields>
