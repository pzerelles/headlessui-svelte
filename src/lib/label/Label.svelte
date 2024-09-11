<script lang="ts" module>
  import type { ElementType, Props, PropsOf } from "$lib/utils/types.js"

  let DEFAULT_LABEL_TAG = "label" as const

  export type LabelProps<TTag extends ElementType = typeof DEFAULT_LABEL_TAG> = Props<TTag> & {
    passive?: boolean
    htmlFor?: string
  }
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_LABEL_TAG">
  import { onMount } from "svelte"
  import { useProvidedId, htmlid } from "../utils/id.js"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { stateFromSlot } from "../utils/state.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { useLabelContext } from "./context.svelte.js"

  const internalId = htmlid()
  const context = useLabelContext()
  const providedHtmlFor = useProvidedId()
  const providedDisabled = useDisabled()

  let {
    ref = $bindable(),
    id = `headlessui-label-${internalId}` as PropsOf<TTag>["id"],
    htmlFor = providedHtmlFor,
    passive = false,
    ...theirOriginalProps
  }: { as?: TTag } & LabelProps<TTag> = $props()

  onMount(() => {
    context.register(id)
  })

  let handleClick = (e: MouseEvent) => {
    let current = e.currentTarget

    // Labels connected to 'real' controls will already click the element. But we don't know that
    // ahead of time. This will prevent the default click, such that only a single click happens
    // instead of two. Otherwise this results in a visual no-op.
    if (current instanceof HTMLLabelElement) {
      e.preventDefault()
    }

    console.log("click", providedHtmlFor)

    if (current instanceof HTMLLabelElement) {
      let target = document.getElementById(current.getAttribute("for") ?? "")
      if (target) {
        // Bail if the target element is disabled
        let actuallyDisabled = target.getAttribute("disabled")
        if (actuallyDisabled === "true" || actuallyDisabled === "") {
          return
        }

        let ariaDisabled = target.getAttribute("aria-disabled")
        if (ariaDisabled === "true" || ariaDisabled === "") {
          return
        }

        // Ensure we click the element this label is bound to. This is necessary for elements that
        // immediately require state changes, e.g.: Radio & Checkbox inputs need to be checked (or
        // unchecked).
        if (
          (target instanceof HTMLInputElement && (target.type === "radio" || target.type === "checkbox")) ||
          target.role === "radio" ||
          target.role === "checkbox" ||
          target.role === "switch"
        ) {
          target.click()
        }

        // Move focus to the element, this allows you to start using keyboard shortcuts since the
        // bound element is now focused.
        target.focus({ preventScroll: true })
      }
    }
  }

  const disabled = $derived(providedDisabled.value ?? false)
  const slot = $derived({ disabled })
  const ourProps = $derived({
    id,
    for: passive ? undefined : htmlFor,
    onclick: passive ? undefined : handleClick,
    ...stateFromSlot(slot),
  })

  const theirProps = $derived.by(() => {
    if (passive) {
      const { onclick: _, ...props } = theirOriginalProps
      return props
    } else {
      return theirOriginalProps
    }
  })
</script>

<ElementOrComponent
  {ourProps}
  {theirProps}
  defaultTag={htmlFor ? DEFAULT_LABEL_TAG : "div"}
  name={context.name || "Label"}
  bind:ref
/>
