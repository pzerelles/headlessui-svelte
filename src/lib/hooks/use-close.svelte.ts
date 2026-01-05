import { getContext, setContext } from "svelte"

export type CloseContext = { close: () => void }

export function useClose() {
  return getContext<CloseContext>("CloseContext")
}

export function createCloseContext(options: { readonly close: () => void }) {
  setContext<CloseContext>("CloseContext", options)
}
