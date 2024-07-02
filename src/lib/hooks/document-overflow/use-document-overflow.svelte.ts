import { overflows } from "./overflow-store.js"

export function useDocumentOverflowLockedEffect(options: {
  shouldBeLocked: boolean
  doc: Document | null
  meta?: (meta: Record<string, any>) => Record<string, any>
}) {
  const { shouldBeLocked, doc, meta = () => ({ containers: [] }) } = $derived(options)
  let store = $state(overflows.getSnapshot())

  $effect(() => {
    const unsubscribe = overflows.subscribe(() => {
      store = overflows.getSnapshot()
    })
    return unsubscribe
  })

  const entry = $derived(doc ? store.get(doc) : undefined)
  const locked = $derived(entry ? entry.count > 0 : false)

  $effect(() => {
    if (!doc || !shouldBeLocked) {
      return
    }

    // Prevent the document from scrolling
    overflows.dispatch("PUSH", doc, meta)

    // Allow document to scroll
    return () => overflows.dispatch("POP", doc, meta)
  })

  return {
    get locked() {
      return locked
    },
  }
}
