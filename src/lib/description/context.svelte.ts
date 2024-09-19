import { getContext, setContext } from "svelte"

interface SharedData {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  slot?: {}
  name?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>
}

export type DescriptionContext = {
  value: string | undefined
  register(value: string): () => void
} & SharedData

export function useDescriptionContext() {
  const context = getContext<DescriptionContext>("DescriptionContext")
  if (!context) {
    const err = new Error("You used a <Description /> component, but it is not inside a relevant parent.")
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
  const { slot, name, props } = $derived(options)

  const descriptionIds = $state<string[]>([])

  const register = (value: string) => {
    descriptionIds.push(value)
    return () => {
      const idx = descriptionIds.indexOf(value)
      if (idx !== -1) descriptionIds.splice(idx, 1)
    }
  }

  const value = $derived(descriptionIds.length > 0 ? descriptionIds.join(" ") : undefined)

  const context: DescriptionContext = {
    register,
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
  }
  setContext<DescriptionContext>("DescriptionContext", context)
  return context
}
