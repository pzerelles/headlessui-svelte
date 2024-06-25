import type { MutableRefObject } from "$lib/utils/ref.js"

function resolveType<TTag>(props: { type?: string; as?: TTag }) {
  if (props.type) return props.type

  const tag = props.as ?? "button"
  if (typeof tag === "string" && tag.toLowerCase() === "button") return "button"

  return undefined
}

export function useResolveButtonType<TTag>(props: { type?: string; as?: TTag }, ref: MutableRefObject<HTMLElement>) {
  let type = $state(resolveType(props))

  $effect(() => {
    type = resolveType(props)
  })

  $effect(() => {
    if (type) return
    if (!ref.current) return

    if (ref.current instanceof HTMLButtonElement && !ref.current.hasAttribute("type")) {
      type = "button"
    }
  })

  return type
}
