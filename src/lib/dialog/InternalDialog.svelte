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
  import { BROWSER } from "esm-env"
  import { DEFAULT_DIALOG_TAG, DialogRenderFeatures, type DialogProps, type DialogRenderPropArg } from "./Dialog.svelte"
  import PortalWrapper from "$lib/portal/PortalWrapper.svelte"

  const internalId = useId()
  let {
    element = $bindable(),
    id = `headlessui-dialog-${internalId}`,
    open: theirOpen,
    onclose,
    initialFocus,
    role: theirRole = "dialog",
    autofocus = true,
    __demoMode = false,
    unmount = false,
    ...theirProps
  }: DialogProps = $props()

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
  const usesOpenClosedState = useOpenClosed()
  const open = $derived(
    theirOpen === undefined && usesOpenClosedState !== null
      ? (usesOpenClosedState.value & State.Open) === State.Open
      : theirOpen
  )

  const ownerDocument = $derived(getOwnerDocument(element))

  const dialogState = $derived(open ? DialogStates.Open : DialogStates.Closed)

  let _state = $state({
    titleId: null,
    panelRef: null,
  } as StateDefinition)

  const close = $derived(() => onclose(false))

  const setTitleId = (id: string | null) => (_state.titleId = id)

  const ready = BROWSER
  const enabled = $derived(ready ? dialogState === DialogStates.Open : false)
  const nestedPortals = useNestedPortals()
  const { portals } = $derived(nestedPortals)

  // We use this because reading these values during initial render(s)
  // can result in `null` rather then the actual elements
  // This doesn't happen when using certain components like a
  // `<Dialog.Title>` because they cause the parent to re-render
  const defaultContainer = $derived(_state.panelRef ?? element)

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
        return defaultContainer ? [defaultContainer] : []
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
          element?.closest<HTMLElement>("[data-headlessui-portal]") ?? null,
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
      console.log("close")
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
      return element
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
    set panelRef(value) {
      _state.panelRef = value
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

  const ourProps = $derived({
    id,
    role,
    tabIndex: -1,
    "aria-modal": __demoMode ? undefined : dialogState === DialogStates.Open ? true : undefined,
    "aria-labelledby": _state.titleId,
    "aria-describedby": describedby.value,
    unmount,
  })

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

<ForcePortalRoot force={true}>
  <Portal>
    <PortalGroup target={element ?? null}>
      <ForcePortalRoot force={false}>
        <PortalWrapper context={nestedPortals}>
          <FocusTrap
            {initialFocus}
            initialFocusFallback={element}
            containers={resolvedRootContainers}
            features={focusTrapFeatures}
          >
            <ElementOrComponent
              {ourProps}
              theirProps={{ ...theirProps }}
              slots={slot}
              defaultTag={DEFAULT_DIALOG_TAG}
              features={DialogRenderFeatures}
              visible={dialogState === DialogStates.Open}
              name="Dialog"
              bind:element
            />
          </FocusTrap>
        </PortalWrapper>
      </ForcePortalRoot>
    </PortalGroup>
  </Portal>
</ForcePortalRoot>
