<script lang="ts" module>
  import type { Props, ElementType } from "$lib/utils/types.js"
  import { onMount } from "svelte"

  const DEFAULT_ITEM_TAG = "svelte:fragment" as const
  type ItemRenderPropArg = {
    /** @deprecated use `focus` instead */
    active: boolean
    focus: boolean
    disabled: boolean
    close: () => void
    props?: Record<string, any>
  }
  type ItemPropsWeControl = "aria-describedby" | "aria-disabled" | "aria-labelledby" | "role" | "tabIndex"

  export type MenuItemProps<TTag extends ElementType = undefined> = Props<
    TTag,
    {},
    ItemRenderPropArg,
    ItemPropsWeControl,
    {
      id?: string
      disabled?: boolean
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import { useId } from "$lib/hooks/use-id.js"
  import { ActivationTrigger, MenuStates, useMenuContext, type MenuItemDataRef } from "./context.svelte.js"
  import { disposables } from "$lib/utils/disposables.js"
  import { useTextValue } from "$lib/hooks/use-text-value.svelte.js"
  import { restoreFocusIfNecessary } from "$lib/utils/focus-management.js"
  import { Focus } from "$lib/utils/calculate-active-index.js"
  import { useTrackedPointer } from "$lib/hooks/use-tracked-pointer.js"
  import { useLabels } from "$lib/label/context.svelte.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { mergeProps } from "$lib/utils/render.js"
  import { useDescriptions } from "$lib/description/context.svelte.js"

  const internalId = useId()
  let {
    element = $bindable(),
    id = `headlessui-menu-item-${internalId}`,
    disabled = false,
    ...theirProps
  }: MenuItemProps<TTag> = $props()
  const _state = useMenuContext("MenuItem")
  const active = $derived(_state.activeItemIndex !== null ? _state.items[_state.activeItemIndex].id === id : false)

  $effect(() => {
    /* We also want to trigger this when the position of the active item changes so that we can re-trigger the scrollIntoView */
    _state.activeItemIndex
    if (_state.__demoMode) return
    if (_state.menuState !== MenuStates.Open) return
    if (!active) return
    if (_state.activationTrigger === ActivationTrigger.Pointer) return
    return disposables().requestAnimationFrame(() => {
      ;(element as HTMLElement)?.scrollIntoView?.({ block: "nearest" })
    })
  })

  const getTextValue = useTextValue({
    get element() {
      return element || null
    },
  })

  const bag: MenuItemDataRef["current"] = $derived({
    disabled,
    domRef: { current: element || null },
    get textValue() {
      return getTextValue()
    },
  })

  onMount(() => {
    _state.registerItem(id, {
      get current() {
        return bag
      },
    })
    return () => _state.unregisterItem(id)
  })

  const handleClick = (event: MouseEvent) => {
    if (disabled) return event.preventDefault()
    _state.closeMenu()
    restoreFocusIfNecessary(_state.buttonElement)
  }

  const handleFocus = () => {
    if (disabled) return _state.goToItem({ focus: Focus.Nothing })
    _state.goToItem({ focus: Focus.Specific, id })
  }

  const pointer = useTrackedPointer()

  const handleEnter = (evt: PointerEvent) => {
    pointer.update(evt)
    if (disabled) return
    if (active) return
    _state.goToItem({ focus: Focus.Specific, id, trigger: ActivationTrigger.Pointer })
  }

  const handleMove = (evt: PointerEvent) => {
    if (!pointer.wasMoved(evt)) return
    if (disabled) return
    if (active) return
    _state.goToItem({ focus: Focus.Specific, id, trigger: ActivationTrigger.Pointer })
  }

  const handleLeave = (evt: PointerEvent) => {
    if (!pointer.wasMoved(evt)) return
    if (disabled) return
    if (!active) return
    _state.goToItem({ focus: Focus.Nothing })
  }

  const labelledby = useLabels()
  const describedby = useDescriptions()

  const slot = $derived({
    active,
    focus: active,
    disabled,
    close: _state.closeMenu,
  } satisfies ItemRenderPropArg)
  const ourProps = $derived(
    mergeProps({
      id,
      role: "menuitem",
      tabindex: disabled === true ? undefined : -1,
      "aria-disabled": disabled === true ? true : undefined,
      "aria-labelledby": labelledby.value,
      "aria-describedby": describedby.value,
      disabled: undefined, // Never forward the `disabled` prop
      onclick: handleClick,
      onfocus: handleFocus,
      onpointerenter: handleEnter,
      onmouseenter: handleEnter,
      onpointermove: handleMove,
      onmousemove: handleMove,
      onpointerleave: handleLeave,
      onmouseleave: handleLeave,
    })
  )
</script>

<ElementOrComponent {ourProps} {theirProps} {slot} defaultTag={DEFAULT_ITEM_TAG} name="MenuItem" bind:element />
