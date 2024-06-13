import { getContext, setContext } from "svelte"

export const createCloseContext = (close: () => void) => setContext<() => void>("Close", close)

export const getCloseContext = () => getContext<(() => void) | undefined>("Close")
