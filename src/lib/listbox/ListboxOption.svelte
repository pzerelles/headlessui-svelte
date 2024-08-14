<script lang="ts" context="module">
  import type { ElementType, HTMLElementType, Props } from "$lib/utils/types.js"

  const DEFAULT_OPTION_TAG = "div" as const
  type OptionRenderPropArg = {
    /** @deprecated use `focus` instead */
    active: boolean
    focus: boolean
    selected: boolean
    disabled: boolean

    selectedOption: boolean
  }
  type OptionPropsWeControl = "aria-disabled" | "aria-selected" | "role" | "tabIndex"

  export type ListboxOptionProps<TTag extends ElementType = typeof DEFAULT_OPTION_TAG, TType = string> = Props<
    TTag,
    OptionRenderPropArg,
    OptionPropsWeControl,
    {
      disabled?: boolean
      value: TType
    }
  >

  export type ListboxOptionChildren = Snippet<[OptionRenderPropArg]>
</script>

<script lang="ts" generics="TTag extends ElementType, TType">
  import { useId } from "$lib/hooks/use-id.js"
  import type { SvelteHTMLElements } from "svelte/elements"
  import {
    ActivationTrigger,
    ListboxStates,
    useActions,
    useData,
    ValueMode,
    type ListboxOptionDataRef,
  } from "./Listbox.svelte"
  import { disposables } from "$lib/utils/disposables.js"
  import { Focus } from "$lib/utils/calculate-active-index.js"
  import { getContext, onMount, type Snippet } from "svelte"
  import { useTextValue } from "$lib/hooks/use-text-value.svelte.js"
  import { useTrackedPointer } from "$lib/hooks/use-tracked-pointer.js"
  import { stateFromSlot } from "$lib/utils/state.js"

  const internalId = useId()
  let {
    as = DEFAULT_OPTION_TAG as TTag,
    ref = $bindable(),
    id = `headlessui-listbox-option-${internalId}`,
    disabled = false,
    value,
    children,
    ...theirProps
  }: { as?: TTag } & ListboxOptionProps<TTag, TType> = $props()
  const usedInSelectedOption = getContext<boolean>("SelectedOptionContext") === true
  const data = useData("ListboxOption")
  const actions = useActions("ListboxOption")

  const active = $derived(data.activeOptionIndex !== null ? data.options[data.activeOptionIndex].id === id : false)

  const selected = $derived(data.isSelected(value))
  const getTextValue = useTextValue({
    get element() {
      return ref as HTMLElement
    },
  })
  const bag: ListboxOptionDataRef<TType>["current"] = $derived({
    disabled,
    value,
    domRef: { current: ref || null },
    get textValue() {
      return getTextValue()
    },
  })

  $effect(() => {
    if (!ref) {
      data.listRef.current.delete(id)
    } else {
      data.listRef.current.set(id, ref)
    }
  })

  $effect(() => {
    if (data.__demoMode) return
    if (data.listboxState !== ListboxStates.Open) return
    if (!active) return
    if (data.activationTrigger === ActivationTrigger.Pointer) return
    return disposables().requestAnimationFrame(() => {
      ;(ref as HTMLElement)?.scrollIntoView?.({ block: "nearest" })
    })
  })

  onMount(() => {
    if (usedInSelectedOption) return
    return actions.registerOption(id, {
      get current() {
        return bag
      },
    })
  })

  const handleClick = (event: { preventDefault: Function }) => {
    if (disabled) return event.preventDefault()
    actions.onChange(value)
    if (data.mode === ValueMode.Single) {
      actions.closeListbox()
      data.buttonRef.current?.focus({ preventScroll: true })
    }
  }

  const handleFocus = () => {
    if (disabled) return actions.goToOption(Focus.Nothing)
    actions.goToOption(Focus.Specific, id)
  }

  const pointer = useTrackedPointer()

  const handleEnter = (evt: PointerEvent) => {
    pointer.update(evt)
    if (disabled) return
    if (active) return
    actions.goToOption(Focus.Specific, id, ActivationTrigger.Pointer)
  }

  const handleMove = (evt: PointerEvent) => {
    if (!pointer.wasMoved(evt)) return
    if (disabled) return
    if (active) return
    actions.goToOption(Focus.Specific, id, ActivationTrigger.Pointer)
  }

  const handleLeave = (evt: PointerEvent) => {
    if (!pointer.wasMoved(evt)) return
    if (disabled) return
    if (!active) return
    actions.goToOption(Focus.Nothing)
  }

  const slot = $derived({
    active,
    focus: active,
    selected,
    disabled,
    selectedOption: selected && usedInSelectedOption,
  } satisfies OptionRenderPropArg)
  const ourProps = $derived(
    !usedInSelectedOption
      ? {
          id,
          role: "option",
          tabIndex: disabled === true ? undefined : -1,
          "aria-disabled": disabled === true ? true : undefined,
          // According to the WAI-ARIA best practices, we should use aria-checked for
          // multi-select,but Voice-Over disagrees. So we use aria-checked instead for
          // both single and multi-select.
          "aria-selected": selected,
          disabled: undefined, // Never forward the `disabled` prop
          onclick: handleClick,
          onfocus: handleFocus,
          onpointerenter: handleEnter,
          onmouseenter: handleEnter,
          onpointermove: handleMove,
          onmousemove: handleMove,
          onpointerleave: handleLeave,
          onmouseleave: handleLeave,
          ...stateFromSlot(slot),
        }
      : {}
  )
</script>

{#if selected || !usedInSelectedOption}
  <svelte:element this={as} bind:this={ref} {...ourProps} {...theirProps}>
    {#if children}{@render children(slot)}{/if}
  </svelte:element>
{/if}
