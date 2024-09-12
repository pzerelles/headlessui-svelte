import { getContext, setContext } from "svelte"

interface SharedData {
  slot?: {}
  name?: string
  props?: Record<string, any>
}

export type LabelContext = {
  value: string | undefined
  register(value: string): () => void
} & SharedData

export function useLabelContext() {
  let context = getContext<LabelContext>("LabelContext")
  if (!context) {
    let err = new Error("You used a <Label /> component, but it is not inside a relevant parent.")
    if (Error.captureStackTrace) Error.captureStackTrace(err, useLabelContext)
    throw err
  }
  return context
}

export function useLabelledBy(alwaysAvailableIds?: (string | undefined | null)[]) {
  const context = getContext<LabelContext>("LabelContext")
  const value = $derived(
    (alwaysAvailableIds?.length ?? 0) > 0
      ? [context?.value, ...alwaysAvailableIds!].filter(Boolean).join(" ")
      : context?.value
  )
  return {
    get value() {
      return value
    },
  }
}

export const useLabels = (options: SharedData & { inherit?: boolean } = {}) => {
  const { slot, name, props, inherit } = $derived(options)

  const parentLabelledBy = useLabelledBy()
  let labelIds = $state<string[]>([])

  const allLabelIds = $derived(inherit && parentLabelledBy.value ? [parentLabelledBy.value, ...labelIds] : labelIds)

  const value = $derived(allLabelIds.length > 0 ? allLabelIds.join(" ") : undefined)

  const context: LabelContext = {
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
      labelIds.push(value)
      return () => {
        const clone = labelIds.slice()
        const idx = clone.indexOf(value)
        if (idx !== -1) clone.splice(idx, 1)
        labelIds = clone
        return labelIds
      }
    },
  }
  setContext<LabelContext>("LabelContext", context)
  return context
}
