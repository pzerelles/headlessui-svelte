<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_HOVER_AREA_TAG = "span" as const
  export type PopoverHoverAreaSlot = {
    open: boolean
    hover: boolean
    disabled: boolean
  }
  export type PopoverHoverAreaPropsWeControl = "aria-controls" | "aria-expanded"

  export type PopoverHoverAreaOwnProps = {
    element?: HTMLElement
    id?: string
    disabled?: boolean
    delay?: number
  }

  export type PopoverHoverAreaProps = Props<
    typeof DEFAULT_HOVER_AREA_TAG,
    PopoverHoverAreaSlot,
    PopoverHoverAreaOwnProps
  >
</script>

<script lang="ts">
  import { useId } from "$lib/hooks/use-id.js"
  import { PopoverStates, usePopoverContext, usePopoverPanelContext } from "./context.svelte.js"
  import { useFloatingReference } from "$lib/internal/floating.svelte.js"
  import { untrack } from "svelte"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const internalId = useId()
  let {
    element = $bindable(),
    id = `headlessui-popover-hover-area-${internalId}`,
    disabled = false,
    delay = 0,
    ...theirProps
  }: PopoverHoverAreaProps = $props()

  const context = usePopoverContext("PopoverHoverArea")
  const panelContext = usePopoverPanelContext()

  // A button inside a panel will just have "close" functionality, no "open" functionality. However,
  // if a `PopoverButton` is rendered inside a `Popover` which in turn is rendered inside a
  // `PopoverPanel` (aka nested popovers), then we need to make sure that the button is able to
  // open the nested popover.
  //
  // The `Popover` itself will also render a `PopoverPanelContext` but with a value of `null`. That
  // way we don't need to keep track of _which_ `PopoverPanel` (if at all) we are in, we can just
  // check if we are in a `PopoverPanel` or not since this will always point to the nearest one and
  // won't pierce through `Popover` components themselves.
  const isWithinPanel = panelContext !== undefined

  $effect(() => {
    // [isWithinPanel, id, dispatch]
    if (isWithinPanel) return
    id
    return untrack(() => {
      context.setButtonId(id)
      return () => {
        context.setButtonId(undefined)
      }
    })
  })

  // This is a little bit different compared to the `id` we already have. The goal is to have a very
  // unique identifier for this specific component. This can be achieved with the `id` from above.
  //
  // However, the difference is for React 17 and lower where the `useId` hook doesn't exist yet.
  // There we will generate a unique ID based on a simple counter, but for SSR this will result in
  // `undefined` first, later it is patched to be a unique ID. The problem is that this patching
  // happens after the component is rendered and therefore there is a moment in time where multiple
  // buttons have the exact same ID and the `state.buttons` would result in something like:
  //
  // ```js
  // ['headlessui-popover-button-undefined', 'headlessui-popover-button-1']
  // ```
  //
  // With this approach we guarantee that there is a unique value for each button.
  const uniqueIdentifier = Symbol()

  const floatingReference = useFloatingReference()
  const { setReference } = $derived(floatingReference)
  $effect(() => {
    setReference(element)
  })
  $effect(() => {
    if (isWithinPanel) return
    element
    untrack(() => {
      if (element) {
        context.buttons.push(uniqueIdentifier)
      } else {
        let idx = context.buttons.indexOf(uniqueIdentifier)
        if (idx !== -1) context.buttons.splice(idx, 1)
      }

      if (context.buttons.length > 1) {
        console.warn("You are already using a <PopoverButton /> but only 1 <PopoverButton /> is supported.")
      }

      if (element) context.setButton(element)
    })
  })

  const { isHovered: hover, hoverProps } = $derived(
    useHover({
      get disabled() {
        return disabled
      },
    })
  )

  const visible = $derived(context.popoverState === PopoverStates.Open)
  const slot = $derived({
    open: visible,
    disabled,
    hover,
  } satisfies PopoverHoverAreaSlot)

  const ourProps = $derived(
    isWithinPanel
      ? mergeProps(
          {
            disabled: disabled || undefined,
          },
          hoverProps
        )
      : mergeProps(
          {
            id: context.buttonId,
            "aria-expanded": context.popoverState === PopoverStates.Open,
            "aria-controls": context.panel ? context.panelId : undefined,
            disabled: disabled || undefined,
          },
          hoverProps
        )
  )

  let timeout: NodeJS.Timeout | undefined

  $effect(() => {
    if (hover && !visible) {
      timeout = setTimeout(() => {
        timeout = undefined
        context.togglePopover()
      }, delay)
    } else if (!hover) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = undefined
      }
      if (visible) context.closePopover()
    }
  })
</script>

<ElementOrComponent
  {ourProps}
  {theirProps}
  slots={slot}
  defaultTag={DEFAULT_HOVER_AREA_TAG}
  name="PopoverHoverArea"
  bind:element
/>
