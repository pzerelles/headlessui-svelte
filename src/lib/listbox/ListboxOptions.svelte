<script lang="ts" context="module">
  import type { ElementType, HTMLElementType, Props } from "$lib/utils/types.js"
  import { mergeProps, RenderFeatures, type PropsForFeatures } from "$lib/utils/render.js"
  import {
    useFloatingPanel,
    useFloatingPanelProps,
    useResolvedAnchor,
    type AnchorPropsWithSelection,
  } from "$lib/internal/floating.svelte.js"

  const DEFAULT_OPTIONS_TAG = "div" as const
  type OptionsRenderPropArg = {
    open: boolean
  }
  type OptionsPropsWeControl =
    | "aria-activedescendant"
    | "aria-labelledby"
    | "aria-multiselectable"
    | "aria-orientation"
    | "role"
    | "tabIndex"

  let OptionsRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

  export type ListboxOptionsProps<TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG> = Props<
    TTag,
    OptionsRenderPropArg,
    OptionsPropsWeControl,
    {
      anchor?: AnchorPropsWithSelection
      portal?: boolean
      modal?: boolean
      transition?: boolean
      ref?: HTMLElementType<TTag> | null
    } & PropsForFeatures<typeof OptionsRenderFeatures>
  >
</script>

<script lang="ts" generics="TTag extends ElementType">
  import { useId } from "$lib/hooks/use-id.js"
  import type { SvelteHTMLElements } from "svelte/elements"
  import { ListboxStates, useActions, useData, ValueMode, type ListboxDataContext } from "./Listbox.svelte"
  import { getOwnerDocument } from "$lib/utils/owner.js"
  import { State, useOpenClosed } from "$lib/internal/open-closed.js"
  import { transitionDataAttributes, useTransition } from "$lib/hooks/use-transition.svelte.js"
  import { useOnDisappear } from "$lib/hooks/use-on-disappear.svelte.js"
  import { useScrollLock } from "$lib/hooks/use-scroll-lock.svelte.js"
  import { useInertOthers } from "$lib/hooks/use-inert-others.svelte.js"
  import { useDidElementMove } from "$lib/hooks/use-did-element-move.svelte.js"
  import { useFrozenData } from "$lib/internal/frozen.svelte.js"
  import { useDisposables } from "$lib/utils/disposables.js"
  import { match } from "$lib/utils/match.js"
  import { Focus } from "$lib/utils/calculate-active-index.js"
  import { focusFrom, Focus as FocusManagementFocus } from "$lib/utils/focus-management.js"
  import { useElementSize } from "$lib/hooks/use-element-size.svelte.js"
  import { getContext, setContext } from "svelte"
  import Hidden from "$lib/internal/Hidden.svelte"
  import Portal from "$lib/portal/Portal.svelte"
  import { stateFromSlot } from "$lib/utils/state.js"

  const internalId = useId()
  let {
    as = DEFAULT_OPTIONS_TAG as TTag,
    ref = $bindable(),
    id = `headlessui-listbox-options-${internalId}` as SvelteHTMLElements[TTag][string],
    anchor: rawAnchor,
    portal = false,
    modal = true,
    transition = false,
    children,
    static: isStatic = false,
    unmount = true,
    ...theirProps
  }: ListboxOptionsProps<TTag> = $props()
  const anchor = $derived(useResolvedAnchor(rawAnchor))

  // Always enable `portal` functionality, when `anchor` is enabled
  $effect(() => {
    if (anchor) {
      portal = true
    }
  })

  const data = useData("Listbox.Options")
  const actions = useActions("Listbox.Options")

  const ownerDocument = $derived(getOwnerDocument(data.optionsRef.current))

  const usesOpenClosedState = useOpenClosed()
  const show = $derived(
    usesOpenClosedState !== null
      ? (usesOpenClosedState.value & State.Open) === State.Open
      : data.listboxState === ListboxStates.Open
  )
  const _transition = useTransition({
    enabled: transition,
    element: ref,
    get show() {
      return show
    },
  })
  const { visible, data: transitionData } = $derived(_transition)

  // Ensure we close the listbox as soon as the button becomes hidden
  useOnDisappear({
    get enabled() {
      return visible
    },
    get ref() {
      return data.buttonRef.current
    },
    get ondisappear() {
      return actions.closeListbox
    },
  })

  // Enable scroll locking when the listbox is visible, and `modal` is enabled
  const scrollLockEnabled = $derived(data.__demoMode ? false : modal && data.listboxState === ListboxStates.Open)
  useScrollLock({
    get enabled() {
      return scrollLockEnabled
    },
    get ownerDocument() {
      return ownerDocument
    },
  })

  // Mark other elements as inert when the listbox is visible, and `modal` is enabled
  const inertOthersEnabled = $derived(data.__demoMode ? false : modal && data.listboxState === ListboxStates.Open)
  useInertOthers({
    get enabled() {
      return inertOthersEnabled
    },
    elements: {
      get allowed() {
        return () => [data.buttonRef.current, data.optionsRef.current]
      },
    },
  })

  // We keep track whether the button moved or not, we only check this when the menu state becomes
  // closed. If the button moved, then we want to cancel pending transitions to prevent that the
  // attached `MenuItems` is still transitioning while the button moved away.
  //
  // If we don't cancel these transitions then there will be a period where the `MenuItems` is
  // visible and moving around because it is trying to re-position itself based on the new position.
  //
  // This can be solved by only transitioning the `opacity` instead of everything, but if you _do_
  // want to transition the y-axis for example you will run into the same issue again.
  const didElementMoveEnabled = $derived(data.listboxState !== ListboxStates.Open)
  const didButtonMove = useDidElementMove({
    get enabled() {
      return didElementMoveEnabled
    },
    get element() {
      return data.buttonRef.current
    },
  })

  // Now that we know that the button did move or not, we can either disable the panel and all of
  // its transitions, or rely on the `visible` state to hide the panel whenever necessary.
  const panelEnabled = $derived(didButtonMove.value ? false : visible)

  // We should freeze when the listbox is visible but "closed". This means that
  // a transition is currently happening and the component is still visible (for
  // the transition) but closed from a functionality perspective.
  const shouldFreeze = $derived(visible && data.listboxState === ListboxStates.Closed)

  // Frozen state, the selected value will only update visually when the user re-opens the <Listbox />
  const frozenValue = useFrozenData({
    get freeze() {
      return shouldFreeze
    },
    get data() {
      return data.value
    },
  })

  const isSelected = (compareValue: unknown) => data.compare(frozenValue, compareValue)

  const selectedOptionIndex = () => {
    if (anchor == null) return null
    if (!anchor?.to?.includes("selection")) return null

    // Only compute the selected option index when using `selection` in the
    // `anchor` prop.
    let idx = data.options.findIndex((option) => isSelected(option.dataRef.current.value))
    // Ensure that if no data is selected, we default to the first item.
    if (idx === -1) idx = 0
    return idx
  }

  const anchorOptions = (() => {
    if (anchor == null) return undefined
    if (selectedOptionIndex === null) return { ...anchor, inner: undefined }

    let elements = Array.from(data.listRef.current.values())

    return {
      ...anchor,
      inner: {
        listRef: { current: elements },
        index: selectedOptionIndex,
      },
    }
  })()

  const floatingPanel = useFloatingPanel(anchorOptions)
  const { setFloating, style } = $derived(floatingPanel)
  const getFloatingPanelProps = useFloatingPanelProps()

  $effect(() => {
    data.optionsRef.current = ref || null
    if (anchor) setFloating(ref)
  })

  const searchDisposables = useDisposables()

  const { listboxState, optionsRef } = $derived(data)
  $effect(() => {
    let container = optionsRef.current
    if (!container) return
    if (listboxState !== ListboxStates.Open) return
    if (container === getOwnerDocument(container)?.activeElement) return

    container?.focus({ preventScroll: true })
  })

  const handleKeyDown = (event: KeyboardEvent) => {
    searchDisposables.dispose()

    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboard-interaction-12

      case " ":
        if (data.searchQuery !== "") {
          event.preventDefault()
          event.stopPropagation()
          return actions.search(event.key)
        }
      // When in type ahead mode, fallthrough
      case "Enter":
        event.preventDefault()
        event.stopPropagation()

        if (data.activeOptionIndex !== null) {
          let { dataRef } = data.options[data.activeOptionIndex]
          actions.onChange(dataRef.current.value)
        }
        if (data.mode === ValueMode.Single) {
          actions.closeListbox()
          data.buttonRef.current?.focus({ preventScroll: true })
        }
        break

      case match(data.orientation, { vertical: "ArrowDown", horizontal: "ArrowRight" }):
        event.preventDefault()
        event.stopPropagation()
        return actions.goToOption(Focus.Next)

      case match(data.orientation, { vertical: "ArrowUp", horizontal: "ArrowLeft" }):
        event.preventDefault()
        event.stopPropagation()
        return actions.goToOption(Focus.Previous)

      case "Home":
      case "PageUp":
        event.preventDefault()
        event.stopPropagation()
        return actions.goToOption(Focus.First)

      case "End":
      case "PageDown":
        event.preventDefault()
        event.stopPropagation()
        return actions.goToOption(Focus.Last)

      case "Escape":
        event.preventDefault()
        event.stopPropagation()
        actions.closeListbox()
        data.buttonRef.current?.focus({ preventScroll: true })
        return

      case "Tab":
        event.preventDefault()
        event.stopPropagation()
        actions.closeListbox()
        focusFrom(data.buttonRef.current!, event.shiftKey ? FocusManagementFocus.Previous : FocusManagementFocus.Next)
        break

      default:
        if (event.key.length === 1) {
          actions.search(event.key)
          searchDisposables.setTimeout(() => actions.clearSearch(), 350)
        }
        break
    }
  }

  const labelledby = $derived(data.buttonRef.current?.id)
  const slot = $derived({
    open: data.listboxState === ListboxStates.Open,
  } satisfies OptionsRenderPropArg)

  const buttonSize = useElementSize({
    get element() {
      return data.buttonRef.current
    },
    unit: true,
  })

  const ourProps = $derived(
    mergeProps(anchor ? getFloatingPanelProps() : {}, {
      id,
      ref: optionsRef,
      "aria-activedescendant": data.activeOptionIndex === null ? undefined : data.options[data.activeOptionIndex]?.id,
      "aria-multiselectable": data.mode === ValueMode.Multi ? true : undefined,
      "aria-labelledby": labelledby,
      "aria-orientation": data.orientation,
      onkeydown: handleKeyDown,
      role: "listbox",
      // When the `Listbox` is closed, it should not be focusable. This allows us
      // to skip focusing the `ListboxOptions` when pressing the tab key on an
      // open `Listbox`, and go to the next focusable element.
      tabIndex: data.listboxState === ListboxStates.Open ? 0 : undefined,
      style: [theirProps.style, style, `--button-width: ${buttonSize.width}`].filter(Boolean).join("; "),
      ...transitionDataAttributes(transitionData),
      ...stateFromSlot(slot),
    })
  )

  const derivedData: ListboxDataContext = {
    ...data,
    get isSelected() {
      return data.mode === ValueMode.Multi ? data.isSelected : isSelected
    },
  }

  setContext("ListboxDataContext", derivedData)
</script>

<Portal enabled={portal ? isStatic || visible : false}>
  {#if !panelEnabled && unmount && !isStatic}
    <Hidden as="span" bind:ref aria-hidden="true" {...ourProps} />
  {:else}
    <svelte:element
      this={as}
      bind:this={ref}
      {...ourProps}
      {...theirProps}
      hidden={isStatic || panelEnabled ? undefined : true}
      style={isStatic || panelEnabled ? theirProps.style : "display: none;"}
    >
      {#if children}{@render children(slot)}{/if}
    </svelte:element>
  {/if}
</Portal>
