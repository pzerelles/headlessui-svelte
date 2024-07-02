export type MutableRefObject<T> = { current: T }

export const useRef = <T>(current: T): MutableRefObject<T> => {
  const ref = $state({ current })
  return ref
}
