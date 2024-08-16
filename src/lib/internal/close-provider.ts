import { getContext, setContext } from "svelte"

export type CloseContext = { close: () => {} }

export function useClose() {
  return getContext<CloseContext>("CloseContext")
}

export function createCloseContext(options: { readonly close: () => {} }) {
  setContext<CloseContext>("CloseContext", options)
}
