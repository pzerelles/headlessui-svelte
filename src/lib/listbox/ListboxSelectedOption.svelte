<script lang="ts" module>
  import type { ElementType, Props } from "$lib/utils/types.js"
  import type { Snippet } from "svelte"

  const DEFAULT_SELECTED_OPTION_TAG = "svelte:fragment"
  type SelectedOptionRenderPropArg = {}
  type SelectedOptionPropsWeControl = never

  export type ListboxSelectedOptionProps<TTag extends ElementType = undefined> = Props<
    TTag,
    {},
    SelectedOptionRenderPropArg,
    SelectedOptionPropsWeControl,
    {
      options: Snippet
      placeholder?: Snippet
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import { useData, ValueMode } from "./Listbox.svelte"
  import { setContext } from "svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  let { element = $bindable(), options, placeholder, ...theirProps }: ListboxSelectedOptionProps<TTag> = $props()

  const data = useData("ListboxSelectedOption")

  const shouldShowPlaceholder = $derived(
    data.value === undefined ||
      data.value === null ||
      (data.mode === ValueMode.Multi && Array.isArray(data.value) && data.value.length === 0)
  )

  setContext("SelectedOptionContext", true)
</script>

{#snippet children()}
  {#if placeholder && shouldShowPlaceholder}
    {@render placeholder()}
  {:else}
    {@render options()}
  {/if}
{/snippet}

<ElementOrComponent
  theirProps={{ ...theirProps, children }}
  defaultTag={DEFAULT_SELECTED_OPTION_TAG}
  name="ListboxSelectedOption"
  bind:element
></ElementOrComponent>
