<script lang="ts">
  import { onMount } from "svelte"
  import Hidden, { HiddenFeatures } from "./Hidden.svelte"

  let { setForm, formId }: { setForm: (form: HTMLFormElement) => void; formId?: string } = $props()

  $effect(() => {
    if (formId) {
      const resolvedForm = document.getElementById(formId) as HTMLFormElement
      if (resolvedForm) setForm(resolvedForm)
    }
  })

  let element = $state<HTMLInputElement>()

  onMount(() => {
    if (!element) return
    const resolvedForm = element.closest("form")
    if (resolvedForm) setForm(resolvedForm)
  })
</script>

{#if !formId}
  <Hidden features={HiddenFeatures.Hidden} as="input" type="hidden" hidden readonly bind:ref={element} />
{/if}
