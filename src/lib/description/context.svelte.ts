import { getContext, setContext } from "svelte"

interface SharedData {
  slot?: {}
  name?: string
  props?: Record<string, any>
}

export type DescriptionContext = {
  value: string | undefined
  register(value: string): () => void
} & SharedData

export function useDescriptionContext() {
  let context = getContext<DescriptionContext>("DescriptionContext")
  if (!context) {
    let err = new Error("You used a <Description /> component, but it is not inside a relevant parent.")
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDescriptionContext)
    throw err
  }
  return context
}

export function useDescribedBy() {
  const context = getContext<DescriptionContext>("DescriptionContext")
  return {
    get value() {
      return context?.value
    },
  }
}

export const useDescriptions = (options: SharedData & { inherit?: boolean } = {}) => {
  const { slot, name, props, inherit } = $derived(options)

  let descriptionIds = $state<string[]>([])

  const value = $derived(descriptionIds.length > 0 ? descriptionIds.join(" ") : undefined)

  const context: DescriptionContext = {
    get slot() {
      return slot
    },
    get name() {
      return name
    },
    get props() {
      return props
    },
    get value() {
      return value
    },
    register(value) {
      descriptionIds.push(value)
      return () => {
        const clone = descriptionIds.slice()
        const idx = clone.indexOf(value)
        if (idx !== -1) clone.splice(idx, 1)
        descriptionIds = clone
        return descriptionIds
      }
    },
  }
  setContext<DescriptionContext>("DescriptionContext", context)
  return context
}
