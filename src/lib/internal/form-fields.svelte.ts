import { getContext, setContext, type Snippet } from "svelte"
import { SvelteSet } from "svelte/reactivity"

export type FormFieldsContext = {
  registerField: (field: Snippet) => () => void
}

export const createFormFieldsContext = () => {
  const fields = new SvelteSet<Snippet>()
  const context = {
    registerField: (field: Snippet) => {
      fields.add(field)
      return () => fields.delete(field)
    },
    get fields() {
      return fields
    },
  }
  setContext<FormFieldsContext>("FormFieldsContext", context)
  return context
}

export const hoistFormFields = (fields: Snippet) => {
  const context = getContext<FormFieldsContext>("FormFieldsContext")
  if (!context) return false
  $effect(() => context.registerField(fields))
}
