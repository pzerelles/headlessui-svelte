<script lang="ts" context="module">
  import type { ElementType, Props } from "$lib/utils/types.js"

  const DEFAULT_GROUP_TAG = "svelte:fragment"

  export type SwitchGroupProps<TTag extends ElementType = typeof DEFAULT_GROUP_TAG> = Props<TTag>

  export type GroupContext = {
    switchElement: HTMLButtonElement | null
  }
</script>

<script lang="ts" generics="TTag extends ElementType">
  import { setContext } from "svelte"
  import { useLabels } from "$lib/label/Label.svelte"
  import { useDescriptions } from "$lib/description/Description.svelte"

  let switchElement = $state<HTMLButtonElement | null>(null)
  useLabels({
    name: "SwitchGroup",
    props: {
      get htmlFor() {
        return switchElement?.id
      },
      onclick: (event: MouseEvent) => {
        if (!switchElement) return
        if (event.currentTarget instanceof HTMLLabelElement) {
          event.preventDefault()
        }
        switchElement.click()
        switchElement.focus({ preventScroll: true })
      },
    },
  })
  useDescriptions()

  setContext<GroupContext>("GroupContext", {
    get switchElement() {
      return switchElement
    },
    set switchElement(element) {
      switchElement = element
    },
  })

  const { as = DEFAULT_GROUP_TAG as TTag, children, ...theirProps }: SwitchGroupProps<TTag> = $props()
</script>

<svelte:element this={as} {...theirProps}>
  {#if children}{@render children({})}{/if}
</svelte:element>
