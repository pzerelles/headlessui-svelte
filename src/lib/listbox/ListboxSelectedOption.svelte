<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"
  import type { Snippet } from "svelte"

  const DEFAULT_SELECTED_OPTION_TAG = "span"
  export type SelectedOptionRenderPropArg = {
    option: Snippet
  }
  type SelectedOptionPropsWeControl = never

  export type ListboxSelectedOptionProps = Props<
    typeof DEFAULT_SELECTED_OPTION_TAG,
    SelectedOptionRenderPropArg,
    {
      element?: HTMLElement
      options: Snippet
      placeholder?: Snippet
    }
  >
</script>

<script lang="ts">
  import { useData, ValueMode } from "./Listbox.svelte"
  import { setContext } from "svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  let { element = $bindable(), options, placeholder, ...theirProps }: ListboxSelectedOptionProps = $props()

  const data = useData("ListboxSelectedOption")

  const shouldShowPlaceholder = $derived(
    data.value === undefined ||
      data.value === null ||
      (data.mode === ValueMode.Multi && Array.isArray(data.value) && data.value.length === 0)
  )

  setContext("SelectedOptionContext", true)
</script>

{#snippet option()}
  {#if placeholder && shouldShowPlaceholder}
    {@render placeholder()}
  {:else}
    {@render options()}
  {/if}
{/snippet}

<ElementOrComponent
  theirProps={{ ...theirProps, ...(theirProps.asChild ? {} : { children: option }) }}
  slot={{ option }}
  defaultTag={DEFAULT_SELECTED_OPTION_TAG}
  name="ListboxSelectedOption"
  bind:element
/>
