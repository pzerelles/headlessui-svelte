<script lang="ts">
  import { disposables } from "../utils/disposables.js"
  import { objectToFormEntries } from "../utils/form.js"
  import FormResolver from "./FormResolver.svelte"
  import { hoistFormFields } from "./form-fields.svelte.js"
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

  const fields = $derived(
    objectToFormEntries(data).map(([name, value]) =>
      compact({
        key: name,
        as: "input",
        type: "hidden",
        form: formId,
        disabled,
        name,
        value,
        ...overrides,
      })
    )
  )

  const hoisted = hoistFormFields(formFields)
</script>

{#snippet formFields()}
  <FormResolver setForm={(value) => (form = value)} {formId} />
  {#each fields as props}
    <Hidden features={HiddenFeatures.Hidden} {...props} />
  {/each}
{/snippet}

{#if !hoisted}{@render formFields()}{/if}
