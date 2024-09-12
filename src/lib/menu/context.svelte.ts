import { calculateActiveIndex, Focus } from "$lib/utils/calculate-active-index.js"
import { sortByDomNode } from "$lib/utils/focus-management.js"
import type { MutableRefObject } from "$lib/utils/ref.svelte.js"
import { getContext } from "svelte"

export enum MenuStates {
  Open,
  Closed,
}

export enum ActivationTrigger {
  Pointer,
  Other,
}

export type MenuItemDataRef = MutableRefObject<{
  textValue?: string
  disabled: boolean
  domRef: MutableRefObject<HTMLElement | null>
}>

export interface StateDefinition {
  __demoMode: boolean
  menuState: MenuStates
  buttonElement: HTMLButtonElement | null
  itemsElement: HTMLElement | null
  items: { id: string; dataRef: MenuItemDataRef }[]
  searchQuery: string
  activeItemIndex: number | null
  activationTrigger: ActivationTrigger
}

export type MenuContext = StateDefinition & {
  closeMenu(): void
  openMenu(): void
  goToItem(
    action:
      | { focus: Focus.Specific; id: string; trigger?: ActivationTrigger }
      | { focus: Exclude<Focus, Focus.Specific>; trigger?: ActivationTrigger }
  ): void
  search(value: string): void
  clearSearch(): void
  registerItem(id: string, dataRef: MenuItemDataRef): void
  unregisterItem(id: string): void
  setButtonElement(element: HTMLButtonElement | null): void
  setItemsElement(element: HTMLElement | null): void
}

export function useMenuContext(component: string) {
  const context = getContext<MenuContext>("MenuContext")
  if (!context) {
    let err = new Error(`<${component} /> is missing a parent <Menu /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useMenuContext)
    throw err
  }
  return context
}

function adjustOrderedState(
  state: StateDefinition,
  adjustment: (items: StateDefinition["items"]) => StateDefinition["items"] = (i) => i
) {
  let currentActiveItem = state.activeItemIndex !== null ? state.items[state.activeItemIndex] : null

  let sortedItems = sortByDomNode(adjustment(state.items.slice()), (item) => item.dataRef.current.domRef.current)

  // If we inserted an item before the current active item then the active item index
  // would be wrong. To fix this, we will re-lookup the correct index.
  let adjustedActiveItemIndex = currentActiveItem ? sortedItems.indexOf(currentActiveItem) : null

  // Reset to `null` in case the currentActiveItem was removed.
  if (adjustedActiveItemIndex === -1) {
    adjustedActiveItemIndex = null
  }

  return {
    items: sortedItems,
    activeItemIndex: adjustedActiveItemIndex,
  }
}

export const stateReducer = (initialState: StateDefinition) => {
  let _state = $state(initialState)
  return {
    get menuState() {
      return _state.menuState
    },
    get buttonElement() {
      return _state.buttonElement
    },
    get itemsElement() {
      return _state.itemsElement
    },
    get items() {
      return _state.items
    },
    get searchQuery() {
      return _state.searchQuery
    },
    get activeItemIndex() {
      return _state.activeItemIndex
    },
    get activationTrigger() {
      return _state.activationTrigger
    },
    get __demoMode() {
      return _state.__demoMode
    },
    closeMenu() {
      if (_state.menuState === MenuStates.Closed) return _state
      _state.activeItemIndex = null
      _state.menuState = MenuStates.Closed
      return _state
    },
    openMenu() {
      if (_state.menuState === MenuStates.Open) return _state
      /* We can turn off demo mode once we re-open the `Menu` */
      _state.__demoMode = false
      _state.menuState = MenuStates.Open
      return _state
    },
    goToItem(
      action:
        | { focus: Focus.Specific; id: string; trigger?: ActivationTrigger }
        | { focus: Exclude<Focus, Focus.Specific>; trigger?: ActivationTrigger }
    ) {
      if (_state.menuState === MenuStates.Closed) return _state

      _state.searchQuery = ""
      _state.activationTrigger = action.trigger ?? ActivationTrigger.Other
      _state.__demoMode = false

      // Optimization:
      //
      // There is no need to sort the DOM nodes if we know that we don't want to focus anything
      if (action.focus === Focus.Nothing) {
        _state.activeItemIndex = null
        return _state
      }

      // Optimization:
      //
      // There is no need to sort the DOM nodes if we know exactly where to go
      if (action.focus === Focus.Specific) {
        _state.activeItemIndex = _state.items.findIndex((o) => o.id === action.id)
        return _state
      }

      // Optimization:
      //
      // If the current DOM node and the previous DOM node are next to each other,
      // or if the previous DOM node is already the first DOM node, then we don't
      // have to sort all the DOM nodes.
      else if (action.focus === Focus.Previous) {
        let activeItemIdx = _state.activeItemIndex
        if (activeItemIdx !== null) {
          let currentDom = _state.items[activeItemIdx].dataRef.current.domRef
          let previousItemIndex = calculateActiveIndex(action, {
            resolveItems: () => _state.items,
            resolveActiveIndex: () => _state.activeItemIndex,
            resolveId: (item) => item.id,
            resolveDisabled: (item) => item.dataRef.current.disabled,
          })
          if (previousItemIndex !== null) {
            let previousDom = _state.items[previousItemIndex].dataRef.current.domRef
            if (
              // Next to each other
              currentDom.current?.previousElementSibling === previousDom.current ||
              // Or already the first element
              previousDom.current?.previousElementSibling === null
            ) {
              _state.activeItemIndex = previousItemIndex
              return _state
            }
          }
        }
      }

      // Optimization:
      //
      // If the current DOM node and the next DOM node are next to each other, or
      // if the next DOM node is already the last DOM node, then we don't have to
      // sort all the DOM nodes.
      else if (action.focus === Focus.Next) {
        let activeItemIdx = _state.activeItemIndex
        if (activeItemIdx !== null) {
          let currentDom = _state.items[activeItemIdx].dataRef.current.domRef
          let nextItemIndex = calculateActiveIndex(action, {
            resolveItems: () => _state.items,
            resolveActiveIndex: () => _state.activeItemIndex,
            resolveId: (item) => item.id,
            resolveDisabled: (item) => item.dataRef.current.disabled,
          })
          if (nextItemIndex !== null) {
            let nextDom = _state.items[nextItemIndex].dataRef.current.domRef
            if (
              // Next to each other
              currentDom.current?.nextElementSibling === nextDom.current ||
              // Or already the last element
              nextDom.current?.nextElementSibling === null
            ) {
              _state.activeItemIndex = nextItemIndex
              return _state
            }
          }
        }
      }

      // Slow path:
      //
      // Ensure all the items are correctly sorted according to DOM position
      let adjustedState = adjustOrderedState(_state)
      let activeItemIndex = calculateActiveIndex(action, {
        resolveItems: () => adjustedState.items,
        resolveActiveIndex: () => adjustedState.activeItemIndex,
        resolveId: (item) => item.id,
        resolveDisabled: (item) => item.dataRef.current.disabled,
      })

      _state.items = adjustedState.items
      _state.activeItemIndex = activeItemIndex
      return _state
    },
    search(value: string) {
      let wasAlreadySearching = _state.searchQuery !== ""
      let offset = wasAlreadySearching ? 0 : 1
      let searchQuery = _state.searchQuery + value.toLowerCase()

      let reOrderedItems =
        _state.activeItemIndex !== null
          ? _state.items
              .slice(_state.activeItemIndex + offset)
              .concat(_state.items.slice(0, _state.activeItemIndex + offset))
          : _state.items

      let matchingItem = reOrderedItems.find(
        (item) => item.dataRef.current.textValue?.startsWith(searchQuery) && !item.dataRef.current.disabled
      )

      let matchIdx = matchingItem ? _state.items.indexOf(matchingItem) : -1
      if (matchIdx === -1 || matchIdx === _state.activeItemIndex) {
        _state.searchQuery = searchQuery
        return _state
      }
      _state.searchQuery = searchQuery
      _state.activeItemIndex = matchIdx
      _state.activationTrigger = ActivationTrigger.Other
      return _state
    },
    clearSearch() {
      if (_state.searchQuery === "") return _state
      _state.searchQuery = ""
      return _state
    },
    registerItem(id: string, dataRef: MenuItemDataRef) {
      let item = { id, dataRef }
      let adjustedState = adjustOrderedState(_state, (items) => [...items, item])

      _state.items = adjustedState.items
      _state.activeItemIndex = adjustedState.activeItemIndex
      return _state
    },
    unregisterItem(id: string) {
      let adjustedState = adjustOrderedState(_state, (items) => {
        let idx = items.findIndex((a) => a.id === id)
        if (idx !== -1) items.splice(idx, 1)
        return items
      })

      _state.items = adjustedState.items
      _state.activeItemIndex = adjustedState.activeItemIndex
      _state.activationTrigger = ActivationTrigger.Other
      return _state
    },
    setButtonElement(element: HTMLButtonElement | null) {
      if (_state.buttonElement === element) return _state
      _state.buttonElement = element
      return _state
    },
    setItemsElement(element: HTMLElement | null) {
      if (_state.itemsElement === element) return _state
      _state.itemsElement = element
      return _state
    },
  }
}
