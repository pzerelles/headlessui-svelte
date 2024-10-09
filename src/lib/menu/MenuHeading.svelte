<script lang="ts" module>
  import { onMount } from "svelte"
  import type { SvelteHTMLElements } from "svelte/elements"
  import type { ElementType, Props } from "../utils/types.js"

  const DEFAULT_HEADING_TAG = "header" as const
  type HeadingRenderPropArg = {}
  type HeadingPropsWeControl = "role"

  export type MenuHeadingProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_HEADING_TAG],
    HeadingRenderPropArg,
    HeadingPropsWeControl
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import { useId } from "../hooks/use-id.js"
  import { useLabelContext } from "../label/context.svelte.js"
  import ElementOrComponent from "../utils/ElementOrComponent.svelte"

  const internalId = useId()
  let {
    element = $bindable(),
    id = `headlessui-menu-heading-${internalId}`,
    ...theirProps
  }: MenuHeadingProps<TTag> = $props()

  const context = useLabelContext()
  onMount(() => context.register(id))

  const ourProps = $derived({ id, role: "presentation", ...context.props })
</script>

<ElementOrComponent {ourProps} {theirProps} defaultTag={DEFAULT_HEADING_TAG} name="MenuItem" bind:element />
