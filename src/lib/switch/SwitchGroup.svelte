<script lang="ts" module>
  import type { PropsAsChild } from "$lib/utils/types.js"

  const DEFAULT_GROUP_TAG = "svelte:fragment"

  export type SwitchGroupProps = PropsAsChild

  export type GroupContext = {
    switchElement: HTMLElement | null
  }
</script>

<script lang="ts">
  import { setContext } from "svelte"
  import { useLabels } from "$lib/label/context.svelte.js"
  import { useDescriptions } from "$lib/description/context.svelte.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  let switchElement = $state<HTMLElement | null>(null)
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

  let { ...theirProps }: SwitchGroupProps = $props()
</script>

<ElementOrComponent {theirProps} name="SwitchGroup" />
