<script lang="ts" module>
  import type { ElementType, Props } from "../utils/types.js"
  import { RenderFeatures, type PropsForFeatures } from "../utils/render.js"
  import type { TransitionEvents, TransitionClasses } from "./context.svelte.js"

  type TransitionChildPropsWeControl = never

  export type TransitionChildProps<TTag extends ElementType = undefined> = Props<
    TTag,
    {},
    TransitionChildRenderPropArg,
    TransitionChildPropsWeControl,
    PropsForFeatures<typeof TransitionChildRenderFeatures> &
      TransitionClasses &
      TransitionEvents & { transition?: boolean; appear?: boolean }
  >

  export const DEFAULT_TRANSITION_CHILD_TAG = "svelte:fragment"
  export type TransitionChildRenderPropArg = HTMLElement
  export const TransitionChildRenderFeatures = RenderFeatures.RenderStrategy
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import { useOpenClosed } from "../internal/open-closed.js"
  import { getContext, type Component } from "svelte"
  import InternalTransitionChild from "./InternalTransitionChild.svelte"
  import Transition from "./Transition.svelte"

  const hasTransitionContext = !!getContext("TransitionContext")
  const hasOpenClosedContext = useOpenClosed() !== null

  let { element = $bindable(), ...props }: TransitionChildProps<TTag> = $props()

  const TransitionRootOrChild = (
    !hasTransitionContext && hasOpenClosedContext ? Transition : InternalTransitionChild
  ) as Component<typeof props, any>
</script>

<TransitionRootOrChild bind:element {...props} />
