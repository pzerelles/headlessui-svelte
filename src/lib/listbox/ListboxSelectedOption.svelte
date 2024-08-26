<script lang="ts" module>
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
      options: Component<any, any>
      placeholder?: Component<any, any>
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_SELECTED_OPTION_TAG">
  import { useData, ValueMode } from "./Listbox.svelte"
  import { setContext } from "svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  let {
    ref = $bindable(),
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

{#snippet children()}
  {#if placeholder && shouldShowPlaceholder}
    {@const Component = placeholder}
    <Component />
  {:else}
    {@const Component = options}
    <Component />
  {/if}
{/snippet}

<ElementOrComponent
  theirProps={{ ...theirProps, children }}
  defaultTag={DEFAULT_SELECTED_OPTION_TAG}
  name="ListboxSelectedOption"
  bind:ref
></ElementOrComponent>
