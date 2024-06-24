import { getContext } from "svelte"

export const useDisabled = () =>
  getContext<{ readonly disabled: boolean } | undefined>("Disabled") ?? { disabled: false }
