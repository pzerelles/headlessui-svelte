<script lang="ts" context="module">
  import type { ElementType, Props } from "$lib/utils/types.js"
  import { RenderFeatures, type PropsForFeatures } from "$lib/utils/render.js"
  import type { TransitionClasses, TransitionEvents } from "./Transition.svelte"

  type TransitionChildPropsWeControl = never

  export type TransitionChildProps<TTag extends ElementType> = Props<
    TTag,
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

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG">
  import { useOpenClosed } from "$lib/internal/open-closed.js"
  import { getContext } from "svelte"
  import InternalTransitionChild from "./InternalTransitionChild.svelte"
  import Transition from "./Transition.svelte"

  const hasTransitionContext = !!getContext("TransitionContext")
  const hasOpenClosedContext = useOpenClosed() !== null

  let { ref = $bindable(), as, ...props }: { as?: TTag } & TransitionChildProps<TTag> = $props()

  const TransitionRootOrChild = !hasTransitionContext && hasOpenClosedContext ? Transition : InternalTransitionChild
</script>

<TransitionRootOrChild bind:ref {...props} />
