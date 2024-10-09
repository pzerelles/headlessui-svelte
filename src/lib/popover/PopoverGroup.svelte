<script lang="ts" module>
  import type { ElementType, Props } from "$lib/utils/types.js"
  import { setContext } from "svelte"
  import type { SvelteHTMLElements } from "svelte/elements"

  const DEFAULT_GROUP_TAG = "div" as const
  type GroupRenderPropArg = {}
  type GroupPropsWeControl = never

  export type PopoverGroupProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_GROUP_TAG],
    GroupRenderPropArg,
    GroupPropsWeControl
  >
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import type { PopoverGroupContext, PopoverRegisterBag } from "./context.svelte"
  import MainTreeProvider from "$lib/internal/MainTreeProvider.svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { getOwnerDocument } from "$lib/utils/owner.js"

  let { element = $bindable(), ...theirProps }: PopoverGroupProps<TTag> = $props()

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

  const slot = {} satisfies GroupRenderPropArg
</script>

<MainTreeProvider>
  <ElementOrComponent {theirProps} slots={slot} defaultTag={DEFAULT_GROUP_TAG} name="PopoverGroup" bind:element />
</MainTreeProvider>
