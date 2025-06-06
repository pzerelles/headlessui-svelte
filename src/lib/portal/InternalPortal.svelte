<script lang="ts" module>
  import { usePortalRoot } from "$lib/internal/portal-force-root.svelte.js"
  import { getOwnerDocument } from "$lib/utils/owner.js"
  import { getContext, onMount, setContext } from "svelte"
  import { env } from "../utils/env.js"
  import type { Props } from "$lib/utils/types.js"
  import type { PortalGroupContext } from "./PortalGroup.svelte"

  function usePortalTarget(options: { element: HTMLElement | null }): { readonly target: HTMLElement | null } {
    const { element } = $derived(options)
    const forceInRoot = usePortalRoot()
    const portalGroupContext = getContext<PortalGroupContext>("PortalGroupContext")
    const { target: groupTarget } = $derived(portalGroupContext ?? {})

    const ownerDocument = $derived(getOwnerDocument(element))

    const initialTarget = () => {
      // Group context is used, but still null
      if (!forceInRoot?.force && groupTarget) return groupTarget ?? null

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
      if (!target) return

      if (!ownerDocument?.body.contains(target)) {
        ownerDocument?.body.appendChild(target)
      }
    })

    $effect(() => {
      if (forceInRoot?.force) return
      if (!groupTarget) return
      target = groupTarget
    })

    return {
      get target() {
        return target
      },
    }
  }

  // ---

  export type PortalParentContext = {
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

    return context
  }

  // ---

  export const DEFAULT_PORTAL_TAG = "div"
  export type PortalRenderPropArg = {}
  type PortalPropsWeControl = never

  export type PortalProps = Props<
    typeof DEFAULT_PORTAL_TAG,
    PortalRenderPropArg,
    {
      element?: HTMLElement
      enabled?: boolean
    }
  >
</script>

<script lang="ts">
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  let { element = $bindable(), ...theirProps }: PortalProps = $props()

  const portalTarget = usePortalTarget({
    get element() {
      return element ?? null
    },
  })
  const { target } = $derived(portalTarget)
  const parent = getContext<PortalParentContext>("PortalParentContext")
  //const ready = useServerHandoffComplete()

  $effect(() => {
    if (!target || !element) return

    // Element already exists in target, always calling target.appendChild(element) will cause a
    // brief unmount/remount.
    if (element.parentNode !== target) {
      element.setAttribute("data-headlessui-portal", "")
      target.appendChild(element)
    }
  })

  onMount(() => {
    if (parent) parent.register(element!)

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

{#if target}
  <ElementOrComponent {theirProps} defaultTag={DEFAULT_PORTAL_TAG} name="InternalPortal" bind:element />
{/if}
