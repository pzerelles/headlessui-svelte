import { getContext } from "svelte"

export const useDisabled = () => {
  const context = getContext<{ readonly value: boolean }>("DisabledContext")
  return {
    get value() {
      return context?.value ?? false
    },
  }
}
