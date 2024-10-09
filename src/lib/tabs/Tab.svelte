<script lang="ts" module>
  import type { ElementType, Props } from "$lib/utils/types.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  const DEFAULT_TAB_TAG = "button" as const
  type TabRenderPropArg = {
    hover: boolean
    focus: boolean
    active: boolean
    autofocus: boolean
    selected: boolean
    disabled: boolean
  }
  type TabPropsWeControl = "aria-controls" | "aria-selected" | "role" | "tabIndex"

  export type TabProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_TAB_TAG],
    TabRenderPropArg,
    TabPropsWeControl,
    {
      autofocus?: boolean
      disabled?: boolean
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import { useId } from "$lib/hooks/use-id.js"
  import { useStableCollectionIndex } from "$lib/utils/StableCollection.svelte"
  import { Focus, focusIn, FocusResult } from "$lib/utils/focus-management.js"
  import { getOwnerDocument } from "$lib/utils/owner.js"
  import { match } from "$lib/utils/match.js"
  import { microTask } from "$lib/utils/microTask.js"
  import { useActivePress } from "$lib/hooks/use-active-press.svelte.js"
  import { useFocusRing } from "$lib/hooks/use-focus-ring.svelte.js"
  import { useResolveButtonType } from "$lib/hooks/use-resolve-button-type.svelte.js"
  import type { MutableRefObject } from "$lib/utils/ref.svelte.js"
  import { onMount } from "svelte"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { useTabs } from "./context.svelte.js"

  const internalId = useId()
  let {
    element = $bindable(),
    id = `headlessui-tabs-tab-${internalId}`,
    disabled = false,
    autofocus = false,
    ...theirProps
  }: TabProps<TTag> = $props()

  const context = useTabs("Tab")
  const { orientation, activation, selectedIndex, tabs, panels, registerTab, change } = $derived(context)

  const tabRef = $derived<MutableRefObject<HTMLElement | undefined>>({ current: element })

  onMount(() => registerTab(tabRef))

  const mySSRIndex = useStableCollectionIndex("tabs")

  const myIndex = $derived.by(() => {
    const index = tabs.findIndex((tab) => tab === tabRef)
    return index === -1 ? mySSRIndex : index
  })
  const selected = $derived(myIndex === selectedIndex)

  const activateUsing = $derived((cb: () => FocusResult) => {
    let result = cb()
    if (result === FocusResult.Success && activation === "auto") {
      let newTab = getOwnerDocument(element)?.activeElement
      let idx = context.tabs.findIndex((tab) => tab.current === newTab)
      if (idx !== -1) change(idx)
    }
    return result
  })

  const handleKeyDown = (event: KeyboardEvent) => {
    let list = tabs.map((tab) => tab.current).filter(Boolean) as HTMLElement[]

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault()
      event.stopPropagation()

      change(myIndex)
      return
    }

    switch (event.key) {
      case "Home":
      case "PageUp":
        event.preventDefault()
        event.stopPropagation()

        return activateUsing(() => focusIn(list, Focus.First))

      case "End":
      case "PageDown":
        event.preventDefault()
        event.stopPropagation()

        return activateUsing(() => focusIn(list, Focus.Last))
    }

    let result = activateUsing(() => {
      return match(orientation, {
        vertical() {
          if (event.key === "ArrowUp") return focusIn(list, Focus.Previous | Focus.WrapAround)
          if (event.key === "ArrowDown") return focusIn(list, Focus.Next | Focus.WrapAround)
          return FocusResult.Error
        },
        horizontal() {
          if (event.key === "ArrowLeft") return focusIn(list, Focus.Previous | Focus.WrapAround)
          if (event.key === "ArrowRight") return focusIn(list, Focus.Next | Focus.WrapAround)
          return FocusResult.Error
        },
      })
    })

    if (result === FocusResult.Success) {
      return event.preventDefault()
    }
  }

  let ready = $state(false)
  const handleSelection = () => {
    if (ready) return
    ready = true

    element?.focus({ preventScroll: true })
    change(myIndex)

    microTask(() => {
      ready = false
    })
  }

  // This is important because we want to only focus the tab when it gets focus
  // OR it finished the click event (mouseup). However, if you perform a `click`,
  // then you will first get the `focus` and then get the `click` event.
  const handleMouseDown = (event: MouseEvent) => {
    event.preventDefault()
  }

  const { isHovered: hover, hoverProps } = $derived(
    useHover({
      get disabled() {
        return disabled
      },
    })
  )
  const { pressed: active, pressProps } = $derived(
    useActivePress({
      get disabled() {
        return disabled
      },
    })
  )
  const { isFocusVisible: focus, focusProps } = $derived(
    useFocusRing({
      get autofocus() {
        return autofocus
      },
    })
  )

  const slot = $derived({
    selected,
    hover,
    active,
    focus,
    autofocus,
    disabled,
  } satisfies TabRenderPropArg)

  const resolvedType = useResolveButtonType({
    get props() {
      return { type: theirProps.type, as: theirProps.as }
    },
    get ref() {
      return tabRef
    },
  })

  const ourProps = $derived(
    mergeProps(
      {
        onkeydown: handleKeyDown,
        onmousedown: handleMouseDown,
        onclick: handleSelection,
        id,
        role: "tab",
        type: resolvedType.type,
        "aria-controls": panels[myIndex]?.current?.id,
        "aria-selected": selected,
        tabIndex: selected ? 0 : -1,
        disabled: disabled || undefined,
        autofocus,
      },
      focusProps,
      hoverProps,
      pressProps
    )
  )
</script>

<ElementOrComponent {ourProps} {theirProps} {slot} defaultTag={DEFAULT_TAB_TAG} name="Tab" bind:element />
