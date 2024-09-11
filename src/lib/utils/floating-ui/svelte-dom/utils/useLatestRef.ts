import type { MutableRefObject } from "$lib/utils/ref.svelte.js"

export function useLatestRef<T>(options: { value: T }) {
  return {
    get current() {
      return options.value
    },
  } as MutableRefObject<T>
}
