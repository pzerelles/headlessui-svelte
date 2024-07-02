<script lang="ts" context="module">
  import { usePortalRoot } from "$lib/internal/portal-force-root.svelte.js"
  import { getOwnerDocument } from "$lib/utils/owner.js"
  import type { MutableRefObject } from "$lib/utils/ref.svelte.js"
  import { getContext, onMount, setContext } from "svelte"
  import { env } from "../utils/env.js"
  import type { ElementType, Props } from "$lib/utils/types.js"
  import Portal from "../internal/Portal.svelte"

  function usePortalTarget(options: { element: HTMLElement | null }): { readonly target: HTMLElement | null } {
    const { element } = $derived(options)
    const forceInRoot = usePortalRoot()
    const groupTarget = getContext<MutableRefObject<HTMLElement | null>>("PortalGroupContext")

    const ownerDocument = $derived(getOwnerDocument(element))

    const initialTarget = () => {
      // Group context is used, but still null
      if (!forceInRoot && groupTarget !== null) return groupTarget.current ?? null

      // No group context is used, let's create a default portal root
      if (env.isServer) return null
      let existingRoot = ownerDocument?.getElementById("headlessui-portal-root")
      if (existingRoot) return existingRoot

      if (ownerDocument === null) return null

      let root = ownerDocument.createElement("div")
      root.setAttribute("id", "headlessui-portal-root")
      return ownerDocument.body.appendChild(root)
    }

    let target = $state(initialTarget())

    // Ensure the portal root is always in the DOM
    $effect(() => {
      if (target === null) return

      if (!ownerDocument?.body.contains(target)) {
        ownerDocument?.body.appendChild(target)
      }
    })

    $effect(() => {
      if (forceInRoot) return
      if (groupTarget === null) return
      target = groupTarget.current
    })

    return {
      get target() {
        return target
      },
    }
  }

  // ---

  type PortalParentContext = {
    register: (portal: HTMLElement) => () => void
    unregister: (portal: HTMLElement) => void
    readonly portals: HTMLElement[]
  }

  export function useNestedPortals() {
    const parent = getContext<PortalParentContext>("PortalParentContext")
    const portals = $state<HTMLElement[]>([])

    const register = (portal: HTMLElement) => {
      portals.push(portal)
      if (parent) parent.register(portal)
      return () => unregister(portal)
    }

    const unregister = (portal: HTMLElement) => {
      let idx = portals.indexOf(portal)
      if (idx !== -1) portals.splice(idx, 1)
      if (parent) parent.unregister(portal)
    }

    const context: PortalParentContext = {
      register,
      unregister,
      get portals() {
        return portals
      },
    }
    setContext("PortalParentContext", context)

    return context
  }

  // ---

  export const DEFAULT_PORTAL_TAG = "svelte:fragment"
  type PortalRenderPropArg = {}
  type PortalPropsWeControl = never

  export type PortalProps<TTag extends ElementType = typeof DEFAULT_PORTAL_TAG> = Props<
    TTag,
    PortalRenderPropArg,
    PortalPropsWeControl,
    {
      enabled?: boolean
    }
  >
</script>

<script lang="ts" generics="TTag extends ElementType">
  let { as = DEFAULT_PORTAL_TAG as TTag, children, ...theirProps }: PortalProps<TTag> = $props()

  let internalPortalRootRef = $state<HTMLElement | null>(null)
  const portalRef = $derived(internalPortalRootRef)
  const ownerDocument = $derived(getOwnerDocument(internalPortalRootRef))
  const portalTarget = usePortalTarget({
    get element() {
      return internalPortalRootRef
    },
  })
  const { target } = $derived(portalTarget)
  const element = $derived(env.isServer ? null : ownerDocument?.createElement("div") ?? null)
  const parent = getContext<PortalParentContext>("PortalParentContext")
  //const ready = useServerHandoffComplete()

  $effect(() => {
    if (!target || !element) return

    // Element already exists in target, always calling target.appendChild(element) will cause a
    // brief unmount/remount.
    if (!target.contains(element)) {
      element.setAttribute("data-headlessui-portal", "")
      target.appendChild(element)
    }
  })

  $effect(() => {
    if (!element) return
    if (!parent) return

    return parent.register(element)
  })

  onMount(() => {
    return () => {
      if (!target || !element) return

      if (element instanceof Node && target.contains(element)) {
        target.removeChild(element)
      }

      if (target.childNodes.length <= 0) {
        target.parentElement?.removeChild(target)
      }
    }
  })
</script>

{#if target && element}
  <Portal target={element}>
    <svelte:element this={as} bind:this={internalPortalRootRef} {...theirProps}>
      {#if children}{@render children({})}{/if}
    </svelte:element>
  </Portal>
{/if}
