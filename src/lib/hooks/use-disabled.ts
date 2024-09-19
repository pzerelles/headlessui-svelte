import { getContext, setContext } from "svelte"

export const useDisabled = () => {
  return getContext<{ readonly current: boolean }>("DisabledContext") ?? { current: false }
}

export const provideDisabled = (disabled: () => boolean) => {
  const parentDisabled = useDisabled()
  const context = {
    get current() {
      return disabled() || parentDisabled.current
    },
  }
  setContext("DisabledContext", context)
  return context
}
