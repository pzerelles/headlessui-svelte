import type { Focus } from "$lib/utils/calculate-active-index.js"
import type { MutableRefObject } from "$lib/utils/ref.svelte.js"
import { getContext } from "svelte"
import type { SvelteMap } from "svelte/reactivity"

export enum ListboxStates {
  Open,
  Closed,
}

export enum ValueMode {
  Single,
  Multi,
}

export enum ActivationTrigger {
  Pointer,
  Other,
}

export type ListboxOptionDataRef<T> = MutableRefObject<{
  textValue?: string
  disabled: boolean
  value: T
  domRef: MutableRefObject<HTMLElement | null>
}>

export interface StateDefinition<T> {
  listboxState: ListboxStates

  options: { id: string; dataRef: ListboxOptionDataRef<T> }[]
  searchQuery: string
  activeOptionIndex: number | null
  activationTrigger: ActivationTrigger

  __demoMode: boolean
}

export interface StateActions<T> {
  openListbox(): void
  closeListbox(): void
  registerOption(id: string, dataRef: ListboxOptionDataRef<T>): void
  unregisterOption(id: string): void
  goToOption(
    action:
      | { focus: Focus.Specific; id: string; trigger?: ActivationTrigger }
      | { focus: Exclude<Focus, Focus.Specific>; trigger?: ActivationTrigger }
  ): void
  search(query: string): void
  clearSearch(): void
}

export type ListboxActionsContext<T = unknown> = {
  registerOption(id: string, dataRef: ListboxOptionDataRef<T>): () => void
  goToOption(focus: Focus.Specific, id: string, trigger?: ActivationTrigger): void
  goToOption(focus: Focus, id?: string, trigger?: ActivationTrigger): void
  selectOption(id: string): void
  selectActiveOption(): void
  onChange(value: T): void
} & Pick<StateActions<T>, "openListbox" | "closeListbox" | "search" | "clearSearch">

export function useActions<T>(component: string) {
  const context = getContext<ListboxActionsContext<T>>("ListboxActionsContext")
  if (!context) {
    const err = new Error(`<${component} /> is missing a parent <Listbox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useActions)
    throw err
  }
  return context
}

export type ListboxDataContext<T = unknown> = {
  value: T
  disabled: boolean
  invalid: boolean
  mode: ValueMode
  orientation: "horizontal" | "vertical"
  activeOptionIndex: number | null
  closeOnSelect?: boolean
  compare(a: T, z: T): boolean
  isSelected(value: T): boolean

  optionsProps: {
    static: boolean
    hold: boolean
  }

  listElements: SvelteMap<string, HTMLElement | null>

  buttonElement: HTMLElement | null
  optionsElement: HTMLElement | null
} & StateDefinition<T>

export function useData<T>(component: string) {
  const context = getContext<ListboxDataContext<T>>("ListboxDataContext")
  if (!context) {
    const err = new Error(`<${component} /> is missing a parent <Listbox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useData)
    throw err
  }
  return context
}
