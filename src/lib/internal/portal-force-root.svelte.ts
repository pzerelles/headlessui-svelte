import { getContext, setContext } from "svelte"

type ForcePortalRootContext = {
  readonly force: boolean
}

export function usePortalRoot() {
  return getContext<ForcePortalRootContext>("ForcePortalRootContext")
}

export function createPortalRoot(context: ForcePortalRootContext) {
  setContext("ForcePortalRootContext", {
    get force() {
      return context.force
    },
  })
}
