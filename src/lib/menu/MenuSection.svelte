<script lang="ts" context="module">
  import type { Snippet } from "svelte"
  import type { ElementType, Props } from "$lib/utils/types.js"

  const DEFAULT_SECTION_TAG = "div" as const
  type SectionRenderPropArg = {}
  type SectionPropsWeControl = "role" | "aria-labelledby"

  export type MenuSectionProps<TTag extends ElementType = typeof DEFAULT_SECTION_TAG> = Props<
    TTag,
    SectionRenderPropArg,
    SectionPropsWeControl
  >

  export type MenuSectionChildren = Snippet<[SectionRenderPropArg]>
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_SECTION_TAG">
  import { useLabels } from "$lib/label/Label.svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const labelledby = useLabels()

  let { ref = $bindable(), ...theirProps }: { as?: TTag } & MenuSectionProps<TTag> = $props()
  const ourProps = $derived({
    "aria-labelledby": labelledby,
    role: "group",
  })
</script>

<ElementOrComponent {ourProps} {theirProps} defaultTag={DEFAULT_SECTION_TAG} name="MenuSection" bind:ref />
