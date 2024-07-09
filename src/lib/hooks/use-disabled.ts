import { getContext } from "svelte"

export const useDisabled = () => getContext<{ readonly value: boolean } | undefined>("Disabled") ?? { value: false }
