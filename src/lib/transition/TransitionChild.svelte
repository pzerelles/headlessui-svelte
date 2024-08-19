<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG">
  import { useOpenClosed } from "$lib/internal/open-closed.js"
  import { getContext, onMount } from "svelte"
  import InternalTransitionChild, {
    DEFAULT_TRANSITION_CHILD_TAG,
    type TransitionChildProps,
  } from "./InternalTransitionChild.svelte"
  import Transition from "./Transition.svelte"
  import type { ElementType } from "$lib/utils/types.js"

  const hasTransitionContext = !!getContext("TransitionContext")
  const hasOpenClosedContext = useOpenClosed() !== null

  let { ref = $bindable(), as, ...props }: { as?: TTag } & TransitionChildProps<TTag> = $props()

  const TransitionRootOrChild = !hasTransitionContext && hasOpenClosedContext ? Transition : InternalTransitionChild
</script>

<TransitionRootOrChild bind:ref {...props} />
