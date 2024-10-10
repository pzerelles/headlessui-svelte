<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_SEPARATOR_TAG = "div" as const

  type SeparatorPropsWeControl = "role"

  export type MenuSeparatorProps = Props<
    typeof DEFAULT_SEPARATOR_TAG,
    {},
    {
      element?: HTMLElement
    }
  >
</script>

<script lang="ts">
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  let { element = $bindable(), ...theirProps }: MenuSeparatorProps = $props()
  const ourProps = { role: "separator" }
</script>

<ElementOrComponent {ourProps} {theirProps} defaultTag={DEFAULT_SEPARATOR_TAG} name="MenuSeparator" bind:element />
