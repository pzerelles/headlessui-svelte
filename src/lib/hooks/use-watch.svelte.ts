import { untrack } from "svelte"

export function useWatch<T extends any[]>(options: {
  action: (newValues: [...T], oldValues: [...T]) => void | (() => void)
  dependencies: [...T]
}) {
  const { action, dependencies } = $derived(options)
  let track = [] as unknown as typeof dependencies

  $effect(() => {
    let oldValues = untrack(() => [...track] as [...T])

    for (let [idx, value] of dependencies.entries()) {
      if (untrack(() => track[idx]) !== value) {
        // At least 1 item changed
        let returnValue = action(dependencies, oldValues)
        track = dependencies
        return returnValue
      }
    }
  })
}
