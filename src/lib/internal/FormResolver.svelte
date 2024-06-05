<script lang="ts">
  import Hidden, { HiddenFeatures } from "./Hidden.svelte"

  let { setForm, formId }: { setForm: (form: HTMLFormElement) => void; formId?: string } = $props()

  $effect(() => {
    if (formId) {
      let resolvedForm = document.getElementById(formId) as HTMLFormElement
      if (resolvedForm) setForm(resolvedForm)
    }
  })
</script>

{#if !formId}
  <Hidden
    features={HiddenFeatures.Hidden}
    as="input"
    type="hidden"
    hidden
    readonly
    ref={(el) => {
      if (!el) return
      let resolvedForm = el.closest("form")
      if (resolvedForm) setForm(resolvedForm)
    }}
  />
{/if}
