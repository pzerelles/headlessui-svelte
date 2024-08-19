<script lang="ts" context="module">
  import { MainTreeProvider } from "$lib/hooks/use-root-containers.svelte.js"
  import { useOpenClosed } from "$lib/internal/open-closed.js"
  import { RenderFeatures, type PropsForFeatures } from "$lib/utils/render.js"
  import type { ElementType, Props } from "$lib/utils/types.js"
  import { getContext, type Component, type Snippet } from "svelte"
  import InternalDialog from "./InternalDialog.svelte"
  import Transition from "$lib/transition/Transition.svelte"

  export const DEFAULT_DIALOG_TAG = "div" as const
  export type DialogRenderPropArg = {
    open: boolean
  }
  type DialogPropsWeControl = "aria-describedby" | "aria-labelledby" | "aria-modal"

  export const DialogRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

  export type DialogProps<TTag extends ElementType = typeof DEFAULT_DIALOG_TAG> = Props<
    TTag,
    DialogRenderPropArg,
    DialogPropsWeControl,
    PropsForFeatures<typeof DialogRenderFeatures> & {
      id?: string
      open?: boolean
      onClose(value: boolean): void
      initialFocus?: HTMLElement
      role?: "dialog" | "alertdialog"
      autofocus?: boolean
      transition?: boolean
      __demoMode?: boolean
    }
  >

  export type DialogChildren = Snippet<[DialogRenderPropArg]>

  export enum DialogStates {
    Open,
    Closed,
  }

  export interface StateDefinition {
    titleId: string | null
    panelRef: HTMLElement | null
  }

  export type DialogContext = StateDefinition & {
    dialogState: DialogStates
    unmount: boolean
    close(): void
    setTitleId(id: string | null): void
  }

  export function useDialogContext(component: string) {
    const context = getContext<DialogContext>("DialogContext")
    if (context === null) {
      let err = new Error(`<${component} /> is missing a parent <Dialog /> component.`)
      if (Error.captureStackTrace) Error.captureStackTrace(err, useDialogContext)
      throw err
    }
    return context
  }
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_DIALOG_TAG">
  let { ref = $bindable(), transition = false, open, ...rest }: { as?: TTag } & DialogProps<TTag> = $props()

  // Validations
  const usesOpenClosedState = useOpenClosed()
  const hasOpen = $derived(open !== undefined || usesOpenClosedState)
  const hasOnClose = $derived(rest.hasOwnProperty("onClose"))

  $effect(() => {
    if (!hasOpen && !hasOnClose) {
      throw new Error(`You have to provide an \`open\` and an \`onClose\` prop to the \`Dialog\` component.`)
    }

    if (!hasOpen) {
      throw new Error(`You provided an \`onClose\` prop to the \`Dialog\`, but forgot an \`open\` prop.`)
    }

    if (!hasOnClose) {
      throw new Error(`You provided an \`open\` prop to the \`Dialog\`, but forgot an \`onClose\` prop.`)
    }

    if (!usesOpenClosedState && typeof open !== "boolean") {
      throw new Error(
        `You provided an \`open\` prop to the \`Dialog\`, but the value is not a boolean. Received: ${open}`
      )
    }

    if (typeof rest.onClose !== "function") {
      throw new Error(
        `You provided an \`onClose\` prop to the \`Dialog\`, but the value is not a function. Received: ${rest.onClose}`
      )
    }
  })

  const DialogComponent = InternalDialog as Component<DialogProps<TTag>, any>
</script>

{#if (open !== undefined || transition) && !rest.static}
  <MainTreeProvider>
    <Transition show={open} {transition} unmount={rest.unmount} {ref}>
      {#snippet children(slot, props)}
        <DialogComponent bind:ref {...props} {...rest} />
      {/snippet}
    </Transition>
  </MainTreeProvider>
{:else}
  <MainTreeProvider>
    <DialogComponent bind:ref {open} {...rest} />
  </MainTreeProvider>
{/if}
