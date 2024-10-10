<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_SECTION_TAG = "div" as const
  type SectionRenderPropArg = {}
  type SectionPropsWeControl = "role" | "aria-labelledby"

  export type MenuSectionProps = Props<
    typeof DEFAULT_SECTION_TAG,
    SectionRenderPropArg,
    {
      element?: HTMLElement
    }
  >
</script>

<script lang="ts">
  import { useLabels } from "$lib/label/context.svelte.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const labelledby = useLabels()

  let { element = $bindable(), ...theirProps }: MenuSectionProps = $props()
  const ourProps = $derived({
    "aria-labelledby": labelledby,
    role: "group",
  })
</script>

<ElementOrComponent {ourProps} {theirProps} defaultTag={DEFAULT_SECTION_TAG} name="MenuSection" bind:element />
