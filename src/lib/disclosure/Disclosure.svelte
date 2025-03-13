<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_DISCLOSURE_TAG = "div" as const
  export type DisclosureRenderPropArg = {
    open: boolean
    close: (focusableElement?: HTMLElement) => void
  }

  export type DisclosureOwnProps = {
    defaultOpen?: boolean
  }

  export type DisclosureProps = Props<typeof DEFAULT_DISCLOSURE_TAG, DisclosureRenderPropArg, DisclosureOwnProps>

  export * from "./context.svelte.js"
</script>

<script lang="ts">
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { createDisclosureAPIContext, createDisclosureContext, DisclosureStates } from "./context.svelte.js"
  import { getOwnerDocument } from "$lib/utils/owner.js"
  import { createOpenClosedContext, State } from "$lib/internal/open-closed.js"
  import { createCloseContext } from "$lib/internal/close-provider.js"

  let { defaultOpen = false, ...theirProps }: DisclosureProps = $props()

  const context = createDisclosureContext(defaultOpen)
  const { buttonId, disclosureState } = $derived(context)

  const close = (focusableElement?: HTMLElement) => {
    context.closeDisclosure()
    const ownerDocument = getOwnerDocument(undefined)
    if (!ownerDocument) return
    if (!buttonId) return

    const restoreElement = (() => {
      if (!focusableElement) return ownerDocument.getElementById(buttonId)
      return focusableElement
    })()

    restoreElement?.focus()
  }

  createDisclosureAPIContext(close)

  const slot = $derived({
    open: disclosureState === DisclosureStates.Open,
    close,
  } satisfies DisclosureRenderPropArg)

  createOpenClosedContext({
    get value() {
      return disclosureState === DisclosureStates.Open ? State.Open : State.Closed
    },
  })

  createCloseContext({ close })
</script>

<ElementOrComponent {theirProps} slots={slot} defaultTag={DEFAULT_DISCLOSURE_TAG} name="Disclosure" />
