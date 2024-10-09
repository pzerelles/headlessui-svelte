import type { MutableRefObject } from "../utils/ref.svelte.js"

function resolveType<TTag>(props: { type?: string; as?: TTag }) {
  if (props.type) return props.type

  const tag = props.as ?? "button"
  if (typeof tag === "string" && tag.toLowerCase() === "button") return "button"

  return undefined
}

export function useResolveButtonType<TTag>(options: {
  props: { type?: string; as?: TTag }
  ref: MutableRefObject<HTMLElement | null | undefined>
}) {
  const { props, ref } = $derived(options)

  return {
    get type() {
      return ref.current && ref.current instanceof HTMLButtonElement && !ref.current.hasAttribute("type")
        ? "button"
        : resolveType(props)
    },
  }
}
