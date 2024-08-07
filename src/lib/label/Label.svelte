<script lang="ts" context="module">
  import type { SvelteHTMLElements } from "svelte/elements"
  import { setContext } from "svelte"

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

  interface SharedData {
    slot?: {}
    name?: string
    props?: Record<string, any>
  }

  export type LabelContext = {
    value: string | undefined
    register(value: string): () => void
  } & SharedData

  export function useLabelContext() {
    let context = getContext<LabelContext>("LabelContext")
    if (context === null) {
      let err = new Error("You used a <Label /> component, but it is not inside a relevant parent.")
      if (Error.captureStackTrace) Error.captureStackTrace(err, useLabelContext)
      throw err
    }
    return context
  }

  export function useLabelledBy(alwaysAvailableIds?: (string | undefined | null)[]) {
    const context = getContext<LabelContext>("LabelContext")
    const value = $derived(
      (alwaysAvailableIds?.length ?? 0) > 0
        ? [context?.value, ...alwaysAvailableIds!].filter(Boolean).join(" ")
        : context?.value
    )
    return {
      get value() {
        return value
      },
    }
  }

  export const useLabels = (options: SharedData & { inherit?: boolean } = {}) => {
    const { slot, name, props, inherit } = $derived(options)

    const parentLabelledBy = useLabelledBy()
    let labelIds = $state<string[]>([])

    const allLabelIds = $derived(inherit && parentLabelledBy.value ? [parentLabelledBy.value, ...labelIds] : labelIds)

    const value = $derived(allLabelIds.length > 0 ? allLabelIds.join(" ") : undefined)

    const context: LabelContext = {
      get slot() {
        return slot
      },
      get name() {
        return name
      },
      get props() {
        return props
      },
      get value() {
        return value
      },
      register(value) {
        labelIds.push(value)
        return () => {
          const clone = labelIds.slice()
          const idx = clone.indexOf(value)
          if (idx !== -1) clone.splice(idx, 1)
          labelIds = clone
          return labelIds
        }
      },
    }
    setContext<LabelContext>("LabelContext", context)
    return context
  }
</script>

<script lang="ts" generics="TTag extends keyof SvelteHTMLElements">
  import { getContext, type Snippet, onMount } from "svelte"
  import { getIdContext, htmlid } from "../utils/id.js"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { stateFromSlot } from "../utils/state.js"

  const internalId = htmlid()
  const context = useLabelContext()
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

  const disabled = $derived(providedDisabled.value ?? false)
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
