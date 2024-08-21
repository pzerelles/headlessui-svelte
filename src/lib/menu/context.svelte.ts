import type { Focus } from "$lib/utils/calculate-active-index.js"
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
