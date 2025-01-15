import { sortByDomNode } from "$lib/utils/focus-management.js"
import { getContext } from "svelte"

interface Option<T = unknown> {
  id: string
  element?: HTMLElement
  propsRef: { value: T; disabled: boolean }
}

export interface StateDefinition<T = unknown> {
  options: Option<T>[]
}

export type RadioGroupDataContext = {
  value: unknown
  firstOption?: Option
  containsCheckedOption: boolean
  disabled: boolean
  compare(a: unknown, z: unknown): boolean
} & StateDefinition

export function useData(component: string) {
  const context = getContext<RadioGroupDataContext>("RadioGroupDataContext")
  if (!context) {
    const err = new Error(`<${component} /> is missing a parent <RadioGroup /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useData)
    throw err
  }
  return context
}

export type RadioGroupActionsContext<T> = {
  registerOption(option: Option<T>): () => void
  change(value: T): boolean
}

export function useActions<T>(component: string) {
  const context = getContext<RadioGroupActionsContext<T>>("RadioGroupActionsContext")
  if (!context) {
    const err = new Error(`<${component} /> is missing a parent <RadioGroup /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useActions)
    throw err
  }
  return context
}

export function createState<T>() {
  let options = $state<Option<T>[]>([])
  return {
    get options() {
      return options
    },
    registerOption(option: Option<T>) {
      const nextOptions = [...options, option]
      options = sortByDomNode(nextOptions, (option) => option.element ?? null)
    },
    unregisterOption(id: string) {
      let idx = options.findIndex((radio) => radio.id === id)
      if (idx === -1) return
      options.splice(idx, 1)
    },
  }
}
