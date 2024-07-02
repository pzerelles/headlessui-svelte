import { untrack } from "svelte"

export function useFrozenData<T>(options: { freeze: boolean; data: T }) {
  const { freeze, data } = $derived(options)
  let frozenValue = $state(data)

  $effect(() => {
    // We should keep updating the frozen value, as long as we shouldn't freeze
    // the value yet. The moment we should freeze the value we stop updating it
    // which allows us to reference the "previous" (thus frozen) value.
    if (!freeze && untrack(() => frozenValue) !== data) {
      frozenValue = data
    }
  })

  return {
    get data() {
      return freeze ? frozenValue : data
    },
  }
}
