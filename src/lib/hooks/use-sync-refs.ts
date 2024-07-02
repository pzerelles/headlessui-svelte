import { useRef, type MutableRefObject } from "$lib/utils/ref.svelte.js"

const Optional = Symbol()

export function optionalRef<T>(cb: (ref: T) => void, isOptional = true) {
  return Object.assign(cb, { [Optional]: isOptional })
}

export function useSyncRefs<TType>(...refs: (MutableRefObject<TType | null> | ((instance: TType) => void) | null)[]) {
  let syncRefs = (value: TType) => {
    for (let ref of refs) {
      if (ref == null) continue
      if (typeof ref === "function") ref(value)
      else ref.current = value
    }
  }

  return refs.every(
    (ref) =>
      ref == null ||
      // @ts-expect-error
      ref?.[Optional]
  )
    ? undefined
    : syncRefs
}
