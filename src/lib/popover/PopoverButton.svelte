<script lang="ts" module>
  import type { ElementType, Props, PropsOf } from "$lib/utils/types.js"

  const DEFAULT_BUTTON_TAG = "button" as const
  export type PopoverButtonSlot = {
    open: boolean
    active: boolean
    hover: boolean
    focus: boolean
    disabled: boolean
    autofocus: boolean
  }
  export type PopoverButtonPropsWeControl = "aria-controls" | "aria-expanded"

  export type PopoverButtonComponentProps = {
    disabled?: boolean
    autofocus?: boolean
  }

  export type PopoverButtonProps<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG> = Props<
    TTag,
    PopoverButtonSlot,
    PopoverButtonPropsWeControl,
    PopoverButtonComponentProps
  >
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_BUTTON_TAG">
  import { useId } from "$lib/hooks/use-id.js"
  import {
    PopoverStates,
    usePopoverAPIContext,
    usePopoverContext,
    usePopoverGroupContext,
    usePopoverPanelContext,
  } from "./context.svelte.js"
  import { useFloatingReference } from "$lib/internal/floating.svelte.js"
  import { untrack } from "svelte"
  import { getOwnerDocument } from "$lib/utils/owner.js"
  import { useFocusRing } from "$lib/hooks/use-focus-ring.svelte.js"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { useActivePress } from "$lib/hooks/use-active-press.svelte.js"
  import { useResolveButtonType } from "$lib/hooks/use-resolve-button-type.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import { useTabDirection, Direction as TabDirection } from "$lib/hooks/use-tab-direction.svelte.js"
  import { match } from "$lib/utils/match.js"
  import { Focus, focusIn, FocusResult, getFocusableElements } from "$lib/utils/focus-management.js"
  import { microTask } from "$lib/utils/microTask.js"
  import Hidden, { HiddenFeatures } from "$lib/internal/Hidden.svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import type { FocusEventHandler } from "svelte/elements"

  const internalId = useId()
  let {
    ref = $bindable(),
    id = `headlessui-popover-button-${internalId}` as PropsOf<TTag>["id"],
    disabled = false,
    autofocus = false as PropsOf<TTag>["autofocus"],
    ...theirProps
  }: { as?: TTag } & PopoverButtonProps<TTag> = $props()
  const context = usePopoverContext("PopoverButton")
  const api = usePopoverAPIContext("PopoverButton")
  const { isPortalled } = $derived(api)

  const sentinelId = `headlessui-focus-sentinel-${useId()}`

  const groupContext = usePopoverGroupContext()
  const closeOthers = $derived(groupContext?.closeOthers)

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
    setReference(ref)
  })
  $effect(() => {
    if (isWithinPanel) return
    ref
    untrack(() => {
      if (ref) {
        context.buttons.push(uniqueIdentifier)
      } else {
        let idx = context.buttons.indexOf(uniqueIdentifier)
        if (idx !== -1) context.buttons.splice(idx, 1)
      }

      if (context.buttons.length > 1) {
        console.warn("You are already using a <PopoverButton /> but only 1 <PopoverButton /> is supported.")
      }

      if (ref) context.setButton(ref)
    })
  })
  const ownerDocument = $derived(getOwnerDocument(ref))

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isWithinPanel) {
      if (context.popoverState === PopoverStates.Closed) return
      switch (event.key) {
        case "Space":
        case "Enter":
          event.preventDefault() // Prevent triggering a *click* event
          // @ts-expect-error
          event.target.click?.()
          context.closePopover()
          context.button?.focus() // Re-focus the original opening Button
          break
      }
    } else {
      switch (event.key) {
        case "Space":
        case "Enter":
          event.preventDefault() // Prevent triggering a *click* event
          event.stopPropagation()
          if (context.popoverState === PopoverStates.Closed) closeOthers?.(context.buttonId!)
          context.togglePopover()
          break

        case "Escape":
          if (context.popoverState !== PopoverStates.Open) return closeOthers?.(context.buttonId!)
          if (!ref) return
          if (ownerDocument?.activeElement && !ref.contains(ownerDocument.activeElement)) {
            return
          }
          event.preventDefault()
          event.stopPropagation()
          context.closePopover()
          break
      }
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    if (isWithinPanel) return
    if (event.key === "Space") {
      // Required for firefox, event.preventDefault() in handleKeyDown for
      // the Space key doesn't cancel the handleKeyUp, which in turn
      // triggers a *click*.
      event.preventDefault()
    }
  }

  const handleClick = (event: MouseEvent) => {
    //if (isDisabledReactIssue7711(event.currentTarget)) return
    if (disabled) return
    if (isWithinPanel) {
      context.closePopover()
      context.button?.focus() // Re-focus the original opening Button
    } else {
      event.preventDefault()
      event.stopPropagation()
      if (context.popoverState === PopoverStates.Closed) closeOthers?.(context.buttonId!)
      context.togglePopover()
      context.button?.focus()
    }
  }

  const handleMouseDown = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const { isFocusVisible: focus, focusProps } = $derived(
    useFocusRing({
      get autofocus() {
        return autofocus
      },
    })
  )
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

  const visible = $derived(context.popoverState === PopoverStates.Open)
  const slot = $derived({
    open: visible,
    active: active || visible,
    disabled,
    hover,
    focus,
    autofocus,
  } satisfies PopoverButtonSlot)

  const type = useResolveButtonType({
    get props() {
      return { type: theirProps.type, as: theirProps.as }
    },
    get ref() {
      return { current: context.button }
    },
  })
  const ourProps = $derived(
    isWithinPanel
      ? mergeProps(
          {
            type,
            onkeydown: handleKeyDown,
            onclick: handleClick,
            disabled: disabled || undefined,
            autofocus,
          },
          focusProps,
          hoverProps,
          pressProps
        )
      : mergeProps(
          {
            id: context.buttonId,
            type,
            "aria-expanded": context.popoverState === PopoverStates.Open,
            "aria-controls": context.panel ? context.panelId : undefined,
            disabled: disabled || undefined,
            autofocus,
            onkeydown: handleKeyDown,
            onkeyup: handleKeyUp,
            onclick: handleClick,
            onmousedown: handleMouseDown,
          },
          focusProps,
          hoverProps,
          pressProps
        )
  )

  const direction = useTabDirection()
  const handleFocus = () => {
    const el = context.panel as HTMLElement
    if (!el) return

    function run() {
      let result = match(direction.current, {
        [TabDirection.Forwards]: () => focusIn(el, Focus.First),
        [TabDirection.Backwards]: () => focusIn(el, Focus.Last),
      })

      if (result === FocusResult.Error) {
        focusIn(
          getFocusableElements().filter((el) => el.dataset.headlessuiFocusGuard !== "true"),
          match(direction.current, {
            [TabDirection.Forwards]: Focus.Next,
            [TabDirection.Backwards]: Focus.Previous,
          }),
          { relativeTo: context.button }
        )
      }
    }

    // TODO: Cleanup once we are using real browser tests
    if (process.env.NODE_ENV === "test") {
      microTask(run)
    } else {
      run()
    }
  }
</script>

<ElementOrComponent
  {ourProps}
  {theirProps}
  slots={slot}
  defaultTag={DEFAULT_BUTTON_TAG}
  name="PopoverButton"
  bind:ref
/>
{#if visible && !isWithinPanel && isPortalled}
  <Hidden
    id={sentinelId}
    bind:ref={context.afterButtonSentinel as HTMLElement}
    features={HiddenFeatures.Focusable}
    data-headlessui-focus-guard
    as="button"
    type="button"
    onfocus={handleFocus}
  />
{/if}
