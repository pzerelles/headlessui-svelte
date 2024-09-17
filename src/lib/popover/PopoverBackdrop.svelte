<script lang="ts" module>
  import type { ElementType, Props, PropsOf } from "$lib/utils/types.js"
  import { RenderFeatures, type PropsForFeatures } from "$lib/utils/render.js"

  let DEFAULT_BACKDROP_TAG = "div" as const
  type BackdropRenderPropArg = {
    open: boolean
  }
  type BackdropPropsWeControl = "aria-hidden"

  const BackdropRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

  export type PopoverBackdropProps<TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG> = Props<
    TTag,
    BackdropRenderPropArg,
    BackdropPropsWeControl,
    { transition?: boolean } & PropsForFeatures<typeof BackdropRenderFeatures>
  >

  export type PopoverOverlayProps<TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG> = PopoverBackdropProps<TTag>
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG">
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { useId } from "$lib/hooks/use-id.js"
  import { PopoverStates, usePopoverContext } from "./context.svelte.js"
  import { State, useOpenClosed } from "$lib/internal/open-closed.js"
  import { transitionDataAttributes, useTransition } from "$lib/hooks/use-transition.svelte.js"

  const internalId = useId()
  let {
    ref = $bindable(),
    id = `headlessui-popover-backdrop-${internalId}` as PropsOf<TTag>["id"],
    transition = false,
    ...theirProps
  }: { as?: TTag } & PopoverBackdropProps<TTag> = $props()
  const context = usePopoverContext("PopoverBackdrop")
  const { popoverState } = $derived(context)

  const usesOpenClosedState = useOpenClosed()
  const _transition = useTransition({
    get enabled() {
      return transition
    },
    get element() {
      return ref
    },
    get show() {
      return usesOpenClosedState !== null
        ? (usesOpenClosedState.value & State.Open) === State.Open
        : popoverState === PopoverStates.Open
    },
  })
  const { visible, data: transitionData } = $derived(_transition)

  const handleClick = (event: MouseEvent) => {
    //if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    context.closePopover()
  }

  const slot = $derived({
    open: popoverState === PopoverStates.Open,
  } satisfies BackdropRenderPropArg)

  const ourProps = $derived({
    id,
    "aria-hidden": true,
    onclick: handleClick,
    ...transitionDataAttributes(transitionData),
  })
</script>

<ElementOrComponent
  {ourProps}
  {theirProps}
  slots={slot}
  defaultTag={DEFAULT_BACKDROP_TAG}
  features={BackdropRenderFeatures}
  name="PopoverBackdrop"
  {visible}
  bind:ref
/>
