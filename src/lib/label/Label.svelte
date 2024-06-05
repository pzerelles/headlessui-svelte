<script lang="ts" context="module">
  import { setContext, untrack } from "svelte"

  export type LabelContext = {
    labelledBy?: string
    register: (id: string) => void
    unregister: (id: string) => void
  }

  export const createLabelContext = () => {
    let labelledBy = $state<string | undefined>()

    setContext<LabelContext>("Label", {
      get labelledBy() {
        return labelledBy
      },
      register(id) {
        labelledBy = untrack(() => (labelledBy === undefined ? id : `${labelledBy} ${id}`.trim()))
      },
      unregister(id) {
        labelledBy = untrack(() =>
          labelledBy
            ?.split(" ")
            .filter((value) => value !== id)
            .join(" ")
        )
      },
    })
  }

  export const getLabelContext = () => getContext<LabelContext>("Label")

  const validateLabelContext = () => {
    const context = getLabelContext()
    if (context === undefined) {
      const err = new Error("You used a <Label /> component, but it is not inside a relevant parent.")
      if (Error.captureStackTrace) Error.captureStackTrace(err, validateLabelContext)
      throw err
    }
    return context
  }
</script>

<script lang="ts" generics="TTag extends keyof svelteHTML.IntrinsicElements">
  import { getContext, type Snippet } from "svelte"
  import { getIdContext, htmlid } from "../utils/id.js"
  import { getDisabledContext } from "$lib/utils/disabled.js"
  import { stateFromSlot } from "$lib/utils/state.js"

  const DEFAULT_LABEL_TAG = "label" as const

  type LabelProps<TTag extends keyof svelteHTML.IntrinsicElements = typeof DEFAULT_LABEL_TAG> =
    svelteHTML.IntrinsicElements[TTag] & {
      as?: TTag
      passive?: boolean
      htmlFor?: string
      children?: Snippet<
        [
          {
            disabled: boolean
          },
        ]
      >
    }

  const internalId = htmlid()
  const context = validateLabelContext()
  const providedHtmlFor = getIdContext()
  const providedDisabled = getDisabledContext()

  let {
    as,
    id = `headlessui-label-${internalId}`,
    htmlFor = providedHtmlFor,
    passive = false,
    children,
    ...theirOriginalProps
  }: LabelProps<TTag> = $props()

  $effect(() => {
    context.register(id)
    const registeredId = id
    return () => {
      context.unregister(registeredId)
    }
  })

  let handleClick = (e: MouseEvent) => {
    let current = e.currentTarget

    // Labels connected to 'real' controls will already click the element. But we don't know that
    // ahead of time. This will prevent the default click, such that only a single click happens
    // instead of two. Otherwise this results in a visual no-op.
    if (current instanceof HTMLLabelElement) {
      e.preventDefault()
    }

    if (current instanceof HTMLLabelElement) {
      let target = document.getElementById(current.htmlFor)
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

  const disabled = $derived(providedDisabled?.disabled ?? false)
  const slot = $derived({ disabled })
  const ourProps = $derived({
    id,
    htmlFor: passive ? undefined : htmlFor,
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

<svelte:element this={as ?? (htmlFor ? DEFAULT_LABEL_TAG : "div")} {...ourProps} {...theirProps}>
  {#if children}
    {@render children(slot)}
  {/if}
</svelte:element>
