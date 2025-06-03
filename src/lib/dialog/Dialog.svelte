<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"
  import { RenderFeatures, type PropsForFeatures } from "$lib/utils/render.js"

  export const DEFAULT_DIALOG_TAG = "div" as const

  export type DialogRenderPropArg = {
    open: boolean
  }
  type DialogPropsWeControl = "aria-describedby" | "aria-labelledby" | "aria-modal"

  export const DialogRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

  export type DialogOwnProps = PropsForFeatures<typeof DialogRenderFeatures> & {
    element?: HTMLElement
    id?: string
    open?: boolean
    onclose(value: boolean): void
    initialFocus?: HTMLElement
    role?: "dialog" | "alertdialog"
    autofocus?: boolean
    transition?: boolean
    __demoMode?: boolean
  }

  export type DialogProps = Props<typeof DEFAULT_DIALOG_TAG, DialogRenderPropArg, DialogOwnProps>
</script>

<script lang="ts">
  import { useOpenClosed } from "$lib/internal/open-closed.js"
  import MainTreeProvider from "$lib/internal/MainTreeProvider.svelte"
  import Transition from "$lib/transition/Transition.svelte"
  import InternalDialog from "./InternalDialog.svelte"

  let { element = $bindable(), transition = false, open, ...rest }: DialogProps = $props()

  // Validations
  const usesOpenClosedState = useOpenClosed()
  const hasOpen = $derived(open !== undefined || usesOpenClosedState)
  const hasOnClose = $derived(rest.hasOwnProperty("onclose"))

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

    if (typeof rest.onclose !== "function") {
      throw new Error(
        `You provided an \`onclose\` prop to the \`Dialog\`, but the value is not a function. Received: ${rest.onclose}`
      )
    }
  })
</script>

{#if (open !== undefined || transition) && !rest.static}
  <MainTreeProvider>
    <Transition asChild show={open} {transition} unmount={rest.unmount} {element}>
      {#snippet children({ props })}
        <InternalDialog {...rest} {...props} bind:element />
      {/snippet}
    </Transition>
  </MainTreeProvider>
{:else}
  <MainTreeProvider>
    <InternalDialog bind:element {open} {...rest} />
  </MainTreeProvider>
{/if}
