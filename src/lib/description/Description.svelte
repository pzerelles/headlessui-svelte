<script lang="ts" module>
  import type { ElementType, Props } from "../utils/types.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  const DEFAULT_DESCRIPTION_TAG = "p" as const

  export type DescriptionProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_DESCRIPTION_TAG]
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import { useId } from "../hooks/use-id.js"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useDescriptionContext } from "./context.svelte.js"
  import ElementOrComponent from "../utils/ElementOrComponent.svelte"
  import { untrack } from "svelte"

  const internalId = useId()
  const providedDisabled = useDisabled()

  let {
    id = `headlessui-description-${internalId}`,
    element = $bindable(),
    ...theirProps
  }: DescriptionProps<TTag> = $props()

  const { register } = useDescriptionContext()
  $effect(() => {
    id
    return untrack(() => register(id))
  })

  const disabled = $derived(providedDisabled.current || false)
  const slot = $derived({ disabled })
  const ourProps = $derived({ id })
</script>

<ElementOrComponent
  {ourProps}
  {theirProps}
  slots={slot}
  defaultTag={DEFAULT_DESCRIPTION_TAG}
  name="Description"
  bind:element
/>
