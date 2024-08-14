<script lang="ts" context="module">
  import type { ElementType, Props } from "$lib/utils/types.js"
  import type { Component } from "svelte"

  const DEFAULT_SELECTED_OPTION_TAG = "svelte:fragment"
  type SelectedOptionRenderPropArg = {}
  type SelectedOptionPropsWeControl = never

  export type ListboxSelectedOptionProps<TTag extends ElementType = typeof DEFAULT_SELECTED_OPTION_TAG> = Props<
    TTag,
    SelectedOptionRenderPropArg,
    SelectedOptionPropsWeControl,
    {
      options: Component
      placeholder?: Component
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType">
  import { useData, ValueMode } from "./Listbox.svelte"
  import { setContext } from "svelte"

  let {
    as = DEFAULT_SELECTED_OPTION_TAG as TTag,
    options,
    placeholder,
    ...theirProps
  }: { as?: TTag } & ListboxSelectedOptionProps<TTag> = $props()

  const data = useData("ListboxSelectedOption")

  const shouldShowPlaceholder = $derived(
    data.value === undefined ||
      data.value === null ||
      (data.mode === ValueMode.Multi && Array.isArray(data.value) && data.value.length === 0)
  )

  setContext("SelectedOptionContext", true)
</script>

<svelte:element this={as} {...theirProps}>
  {#if placeholder && shouldShowPlaceholder}
    <svelte:component this={placeholder} />
  {:else}
    <svelte:component this={options} />
  {/if}
</svelte:element>
