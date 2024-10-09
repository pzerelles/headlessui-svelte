<script lang="ts" module>
  import type { SvelteHTMLElements } from "svelte/elements"
  import type { ElementType, Props } from "../utils/types.js"

  const DEFAULT_SECTION_TAG = "div" as const
  type SectionRenderPropArg = {}
  type SectionPropsWeControl = "role" | "aria-labelledby"

  export type MenuSectionProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_SECTION_TAG],
    SectionRenderPropArg,
    SectionPropsWeControl
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import { useLabels } from "../label/context.svelte.js"
  import ElementOrComponent from "../utils/ElementOrComponent.svelte"

  const labelledby = useLabels()

  let { element = $bindable(), ...theirProps }: MenuSectionProps<TTag> = $props()
  const ourProps = $derived({
    "aria-labelledby": labelledby,
    role: "group",
  })
</script>

<ElementOrComponent {ourProps} {theirProps} defaultTag={DEFAULT_SECTION_TAG} name="MenuSection" bind:element />
