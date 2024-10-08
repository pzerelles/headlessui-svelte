<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"
  import { setContext } from "svelte"

  const DEFAULT_GROUP_TAG = "div" as const

  export type PopoverGroupOwnProps = {
    element?: HTMLElement
  }

  export type PopoverGroupProps = Props<typeof DEFAULT_GROUP_TAG, {}, PopoverGroupOwnProps>
</script>

<script lang="ts">
  import type { PopoverGroupContext, PopoverRegisterBag } from "./context.svelte"
  import MainTreeProvider from "$lib/internal/MainTreeProvider.svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { getOwnerDocument } from "$lib/utils/owner.js"

  let { element = $bindable(), ...theirProps }: PopoverGroupProps = $props()

  const popovers = $state<PopoverRegisterBag[]>([])

  const unregisterPopover = (registerBag: PopoverRegisterBag) => {
    const idx = popovers.indexOf(registerBag)
    if (idx !== -1) popovers.splice(idx, 1)
  }

  const registerPopover = (registerBag: PopoverRegisterBag) => {
    popovers.push(registerBag)
    return () => unregisterPopover(registerBag)
  }

  const isFocusWithinPopoverGroup = () => {
    const ownerDocument = getOwnerDocument(element)
    if (!ownerDocument) return false
    const el = ownerDocument.activeElement

    if (element?.contains(element)) return true

    // Check if the focus is in one of the button or panel elements. This is important in case you are rendering inside a Portal.
    return popovers.some((bag) => {
      return (
        ownerDocument!.getElementById(bag.buttonId!)?.contains(el) ||
        ownerDocument!.getElementById(bag.panelId!)?.contains(el)
      )
    })
  }

  const closeOthers = (buttonId: string) => {
    for (const popover of popovers) {
      if (popover.buttonId !== buttonId) popover.close()
    }
  }

  setContext<PopoverGroupContext>("PopoverGroupContext", {
    registerPopover,
    unregisterPopover,
    isFocusWithinPopoverGroup,
    closeOthers,
  })
</script>

<MainTreeProvider>
  <ElementOrComponent {theirProps} defaultTag={DEFAULT_GROUP_TAG} name="PopoverGroup" bind:element />
</MainTreeProvider>
