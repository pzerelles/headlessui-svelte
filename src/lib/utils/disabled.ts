import { getContext } from "svelte"

export const getDisabledContext = () => getContext<{ readonly disabled: boolean } | undefined>("Disabled")
