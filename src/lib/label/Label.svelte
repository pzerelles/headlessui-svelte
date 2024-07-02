<script lang="ts" context="module">
  import type { SvelteHTMLElements } from "svelte/elements"
  import { setContext, untrack } from "svelte"

  export type LabelProps<TTag extends keyof SvelteHTMLElements = typeof DEFAULT_LABEL_TAG> =
    SvelteHTMLElements[TTag] & {
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

  const DEFAULT_LABEL_TAG = "label" as const

  export type LabelContext = {
    labelledBy?: string
    register: (id: string) => void
    unregister: (id: string) => void
  }

  export const createLabelContext = () => {
    let labelledBy = $state<string | undefined>()
    const context: LabelContext = {
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
    }

    return setContext("Label", context)
  }

  export const getLabelContext = (alwaysAvailableIds?: (string | undefined | null)[]) => {
    const context = getContext<LabelContext | undefined>("Label")
    if ((alwaysAvailableIds?.length ?? 0) > 0) {
      return (
        context &&
        ({
          ...context,
          get labelledBy() {
            return [context?.labelledBy, ...alwaysAvailableIds!].filter(Boolean).join(" ")
          },
        } satisfies LabelContext)
      )
    }
    return context
  }

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

<script lang="ts" generics="TTag extends keyof SvelteHTMLElements">
  import { getContext, type Snippet } from "svelte"
  import { getIdContext, htmlid } from "../utils/id.js"
  import { useDisabled } from "../internal/disabled.js"
  import { stateFromSlot } from "../utils/state.js"

  const internalId = htmlid()
  const context = validateLabelContext()
  const providedHtmlFor = getIdContext()
  const providedDisabled = useDisabled()

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
      let target = document.getElementById(current.getAttribute("htmlFor") ?? "")
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
  {#if children}{@render children(slot)}{/if}
</svelte:element>
