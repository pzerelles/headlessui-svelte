<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"
  import { RenderFeatures, renderProps, type PropsForFeatures } from "$lib/utils/render.js"

  export type DialogRenderPropArg = {
    open: boolean
  }
  type DialogPropsWeControl = "aria-describedby" | "aria-labelledby" | "aria-modal"

  export const DialogRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

  export type DialogProps = Props<
    "div",
    DialogRenderPropArg,
    DialogPropsWeControl,
    PropsForFeatures<typeof DialogRenderFeatures> & {
      open?: boolean
      onclose(value: boolean): void
      initialFocus?: HTMLElement
      role?: "dialog" | "alertdialog"
      transition?: boolean
      __demoMode?: boolean
    }
  >
</script>

<script lang="ts">
  import { useId } from "$lib/hooks/use-id.js"
  import { useMainTreeNode, useRootContainers } from "$lib/hooks/use-root-containers.svelte.js"
  import { clearOpenClosedContext, State, useOpenClosed } from "$lib/internal/open-closed.js"
  import { useNestedPortals } from "$lib/portal/InternalPortal.svelte"
  import { getOwnerDocument } from "$lib/utils/owner.js"
  import { useInertOthers } from "$lib/hooks/use-inert-others.svelte.js"
  import { useOutsideClick } from "$lib/hooks/use-outside-click.svelte.js"
  import { useEscape } from "$lib/hooks/use-escape.svelte.js"
  import { useScrollLock } from "$lib/hooks/use-scroll-lock.svelte.js"
  import { useOnDisappear } from "$lib/hooks/use-on-disappear.svelte.js"
  import { setContext } from "svelte"
  import { useIsTouchDevice } from "$lib/hooks/use-is-touch-device.svelte.js"
  import FocusTrap, { FocusTrapFeatures } from "$lib/focus-trap/FocusTrap.svelte"
  import Portal from "$lib/portal/Portal.svelte"
  import PortalGroup from "$lib/portal/PortalGroup.svelte"
  import ForcePortalRoot from "$lib/internal/ForcePortalRoot.svelte"
  import { createCloseContext } from "$lib/internal/close-provider.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { DialogStates, type DialogContext, type StateDefinition } from "./context.svelte.js"
  import { useDescriptions } from "$lib/description/context.svelte.js"
  import MainTreeProvider from "$lib/internal/MainTreeProvider.svelte"
  import Transition from "$lib/transition/Transition.svelte"

  const internalId = useId()
  let {
    id = `headlessui-dialog-${internalId}`,
    open: theirOpen,
    onclose,
    initialFocus,
    role: theirRole = "dialog",
    autofocus,
    __demoMode = false,
    unmount = false,
    transition = false,
    children,
    ...theirProps
  }: DialogProps = $props()

  // Validations
  const usesOpenClosedState = useOpenClosed()
  const hasOpen = $derived(theirOpen !== undefined || usesOpenClosedState)
  const hasOnClose = $derived(theirProps.hasOwnProperty("onclose"))

  $effect(() => {
    if (!hasOpen && !hasOnClose) {
      throw new Error(`You have to provide an \`open\` and an \`onclose\` prop to the \`Dialog\` component.`)
    }

    if (!hasOpen) {
      throw new Error(`You provided an \`onclose\` prop to the \`Dialog\`, but forgot an \`open\` prop.`)
    }

    if (!hasOnClose) {
      throw new Error(`You provided an \`open\` prop to the \`Dialog\`, but forgot an \`onclose\` prop.`)
    }

    if (!usesOpenClosedState && typeof open !== "boolean") {
      throw new Error(
        `You provided an \`open\` prop to the \`Dialog\`, but the value is not a boolean. Received: ${open}`
      )
    }

    if (typeof onclose !== "function") {
      throw new Error(
        `You provided an \`onclose\` prop to the \`Dialog\`, but the value is not a function. Received: ${onclose}`
      )
    }
  })

  let didWarnOnRole = $state(false)

  const role = $derived.by(() => {
    if (theirRole === "dialog" || theirRole === "alertdialog") {
      return theirRole
    }

    if (!didWarnOnRole) {
      didWarnOnRole = true
      console.warn(
        `Invalid role [${theirRole}] passed to <Dialog />. Only \`dialog\` and and \`alertdialog\` are supported. Using \`dialog\` instead.`
      )
    }

    return "dialog"
  })

  // Update the `open` prop based on the open closed state
  const open = $derived(
    theirOpen === undefined && usesOpenClosedState !== null
      ? (usesOpenClosedState.value & State.Open) === State.Open
      : theirOpen
  )

  let ref = $state<HTMLElement>()
  const ownerDocument = $derived(getOwnerDocument(ref))

  const dialogState = $derived(open ? DialogStates.Open : DialogStates.Closed)

  let _state = $state({
    titleId: null,
    panelRef: null,
  } as StateDefinition)

  const close = $derived(() => onclose(false))

  const setTitleId = (id: string | null) => (_state.titleId = id)

  const enabled = $derived(dialogState === DialogStates.Open)
  const nestedPortals = useNestedPortals()
  const { portals } = $derived(nestedPortals)

  // We use this because reading these values during initial render(s)
  // can result in `null` rather then the actual elements
  // This doesn't happen when using certain components like a
  // `<Dialog.Title>` because they cause the parent to re-render
  const defaultContainer: { readonly current: HTMLElement | undefined } = {
    get current() {
      return _state.panelRef ?? ref
    },
  }

  const mainTreeNode = useMainTreeNode()
  let { resolvedContainers: resolvedRootContainers } = $derived(
    useRootContainers({
      get mainTreeNode() {
        return mainTreeNode.node
      },
      get portals() {
        return portals
      },
      get defaultContainers() {
        return defaultContainer.current ? [defaultContainer.current] : []
      },
    })
  )

  // When the `Dialog` is wrapped in a `Transition` (or another Headless UI component that exposes
  // the OpenClosed state) then we get some information via context about its state. When the
  // `Transition` is about to close, then the `State.Closing` state will be exposed. This allows us
  // to enable/disable certain functionality in the `Dialog` upfront instead of waiting until the
  // `Transition` is done transitioning.
  const isClosing = $derived(
    usesOpenClosedState !== null ? (usesOpenClosedState.value & State.Closing) === State.Closing : false
  )

  // Ensure other elements can't be interacted with
  const inertOthersEnabled = $derived(__demoMode ? false : isClosing ? false : enabled)
  useInertOthers({
    get enabled() {
      return inertOthersEnabled
    },
    elements: {
      get allowed() {
        return [
          // Allow the headlessui-portal of the Dialog to be interactive. This
          // contains the current dialog and the necessary focus guard elements.
          ref?.closest<HTMLElement>("[data-headlessui-portal]") ?? null,
        ]
      },
      get disallowed() {
        return [
          // Disallow the "main" tree root node
          mainTreeNode.node?.closest<HTMLElement>("body > *:not(#headlessui-portal-root)") ?? null,
        ]
      },
    },
  })

  // Close Dialog on outside click
  useOutsideClick({
    get enabled() {
      return enabled
    },
    get containers() {
      return resolvedRootContainers
    },
    cb(event) {
      event.preventDefault()
      close()
    },
  })

  // Handle `Escape` to close
  useEscape({
    get enabled() {
      return enabled
    },
    get view() {
      return ownerDocument?.defaultView ?? null
    },
    cb(event) {
      event.preventDefault()
      event.stopPropagation()

      // Ensure that we blur the current activeElement to prevent maintaining
      // focus and potentially scrolling the page to the end (because the Dialog
      // is rendered in a Portal at the end of the document.body and the browser
      // tries to keep the focused element in view)
      //
      // Typically only happens in Safari.
      if (
        document.activeElement &&
        "blur" in document.activeElement &&
        typeof document.activeElement.blur === "function"
      ) {
        document.activeElement.blur()
      }

      close()
    },
  })

  // Scroll lock
  const scrollLockEnabled = $derived(__demoMode ? false : isClosing ? false : enabled)
  useScrollLock({
    get enabled() {
      return scrollLockEnabled
    },
    get ownerDocument() {
      return ownerDocument
    },
    resolveAllowedContainers() {
      return resolvedRootContainers
    },
  })

  // Ensure we close the dialog as soon as the dialog itself becomes hidden
  useOnDisappear({
    get enabled() {
      return enabled
    },
    get ref() {
      return ref
    },
    get ondisappear() {
      return close
    },
  })

  const describedby = useDescriptions()

  setContext<DialogContext>("DialogContext", {
    get titleId() {
      return _state.titleId
    },
    get panelRef() {
      return _state.panelRef
    },
    get dialogState() {
      return dialogState
    },
    get close() {
      return close
    },
    get unmount() {
      return unmount
    },
    setTitleId,
  })

  const slot = $derived({ open: dialogState === DialogStates.Open } satisfies DialogRenderPropArg)

  const ourProps = $derived(
    renderProps(
      [
        theirProps,
        {
          id,
          role,
          tabIndex: -1,
          "aria-modal": __demoMode ? undefined : dialogState === DialogStates.Open ? true : undefined,
          "aria-labelledby": _state.titleId,
          "aria-describedby": describedby.value,
          unmount,
        },
      ],
      { slot, features: DialogRenderFeatures, visible: dialogState === DialogStates.Open }
    )
  )

  const shouldMoveFocusInside = !useIsTouchDevice().value
  const focusTrapFeatures = $derived.by(() => {
    let focusTrapFeatures = FocusTrapFeatures.None

    if (enabled && !__demoMode) {
      focusTrapFeatures |= FocusTrapFeatures.RestoreFocus
      focusTrapFeatures |= FocusTrapFeatures.TabLock

      if (autofocus) {
        focusTrapFeatures |= FocusTrapFeatures.AutoFocus
      }

      if (shouldMoveFocusInside) {
        focusTrapFeatures |= FocusTrapFeatures.InitialFocus
      }
    }

    return focusTrapFeatures
  })

  clearOpenClosedContext()
  createCloseContext({
    get close() {
      return close
    },
  })
</script>

{#snippet internal(transitionProps?: Record<string, any>)}
  {@const t = console.log(transitionProps)}
  <ForcePortalRoot force={true}>
    <Portal>
      <PortalGroup target={ref ?? null}>
        <ForcePortalRoot force={false}>
          <FocusTrap
            {initialFocus}
            initialFocusFallback={ref}
            containers={resolvedRootContainers}
            features={focusTrapFeatures}
          >
            {#if ourProps}
              <button {...ourProps}>
                {#if children}{@render children({ slot })}{/if}
              </button>
            {/if}
          </FocusTrap>
        </ForcePortalRoot>
      </PortalGroup>
    </Portal>
  </ForcePortalRoot>
{/snippet}

{#if (open !== undefined || transition) && !theirProps.static}
  <MainTreeProvider>
    <Transition show={open} {transition} {unmount}>
      {#snippet children({ props })}
        {@render internal(props)}
      {/snippet}
    </Transition>
  </MainTreeProvider>
{:else}
  <MainTreeProvider>
    {@render internal()}
  </MainTreeProvider>
{/if}
