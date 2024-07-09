import { getContext, setContext } from "svelte"

type IdContext = {
  value?: string
}

export function useProvidedId() {
  return getContext<IdContext>("IdContext")
}

export function useIdContext(options: { id?: string }) {
  setContext<IdContext>("IdContext", {
    get value() {
      return options.id
    },
  })
}
