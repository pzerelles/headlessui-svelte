<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"
  import { RenderFeatures, type PropsForFeatures } from "$lib/utils/render.js"
  import type { TransitionEvents, TransitionClasses } from "./context.svelte.js"

  type TransitionChildPropsWeControl = never

  export type TransitionChildProps = Props<
    typeof DEFAULT_TRANSITION_CHILD_TAG,
    TransitionChildRenderPropArg,
    PropsForFeatures<typeof TransitionChildRenderFeatures> &
      TransitionClasses &
      TransitionEvents & { transition?: boolean; appear?: boolean; element?: HTMLElement }
  >

  export const DEFAULT_TRANSITION_CHILD_TAG = "div"
  export type TransitionChildRenderPropArg = { element?: HTMLElement }
  export const TransitionChildRenderFeatures = RenderFeatures.RenderStrategy
</script>

<script lang="ts">
  import { useOpenClosed } from "$lib/internal/open-closed.js"
  import { getContext } from "svelte"
  import InternalTransitionChild from "./InternalTransitionChild.svelte"
  import Transition from "./Transition.svelte"

  const hasTransitionContext = !!getContext("TransitionContext")
  const hasOpenClosedContext = useOpenClosed() !== null

  let { element = $bindable(), ...props }: TransitionChildProps = $props()

  const TransitionRootOrChild = !hasTransitionContext && hasOpenClosedContext ? Transition : InternalTransitionChild
</script>

<TransitionRootOrChild bind:element {...props} />
