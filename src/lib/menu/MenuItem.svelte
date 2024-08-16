<script lang="ts" context="module">
  import type { Props, ElementType, Children } from "$lib/utils/types.js"
  import { onMount, type Snippet } from "svelte"

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

  export type MenuItemProps<TTag extends ElementType = typeof DEFAULT_ITEM_TAG> = Props<
    TTag,
    ItemRenderPropArg,
    ItemPropsWeControl | "children",
    {
      id?: string
      disabled?: boolean
      children: Children<ItemRenderPropArg>
    }
  >

  export type MenuItemChildren = Children<ItemRenderPropArg>
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_ITEM_TAG">
  import { useId } from "$lib/hooks/use-id.js"
  import { ActivationTrigger, MenuStates, useMenuContext, type MenuItemDataRef } from "./Menu.svelte"
  import { disposables } from "$lib/utils/disposables.js"
  import { useTextValue } from "$lib/hooks/use-text-value.svelte.js"
  import { restoreFocusIfNecessary } from "$lib/utils/focus-management.js"
  import { Focus } from "$lib/utils/calculate-active-index.js"
  import { useTrackedPointer } from "$lib/hooks/use-tracked-pointer.js"
  import { useDescriptions } from "$lib/description/Description.svelte"
  import { useLabels } from "$lib/label/Label.svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { mergeProps } from "$lib/utils/render.js"

  const internalId = useId()
  let {
    ref = $bindable(),
    id = `headlessui-menu-item-${internalId}`,
    disabled = false,
    ...theirProps
  }: { as?: TTag } & MenuItemProps<TTag> = $props()
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
      ;(ref as HTMLElement)?.scrollIntoView?.({ block: "nearest" })
    })
  })

  const getTextValue = useTextValue({
    get element() {
      return ref || null
    },
  })

  const bag: MenuItemDataRef["current"] = $derived({
    disabled,
    domRef: { current: ref || null },
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

<ElementOrComponent {ourProps} {theirProps} {slot} defaultTag={DEFAULT_ITEM_TAG} name="MenuItem" bind:ref />
