<script lang="ts" module>
  import { RenderFeatures, type PropsForFeatures } from "$lib/utils/render.js"
  import type { TransitionEvents, TransitionClasses } from "./context.svelte.js"

  import type { Props } from "$lib/utils/types.js"

  export type TransitionChildProps = Props<
    "span",
    {},
    never,
    PropsForFeatures<typeof TransitionChildRenderFeatures> &
      TransitionClasses &
      TransitionEvents & { transition?: boolean; appear?: boolean; ref?: HTMLElement; class?: string }
  >

  export const TransitionChildRenderFeatures = RenderFeatures.RenderStrategy
</script>

<script lang="ts">
  import { useOpenClosed } from "$lib/internal/open-closed.js"
  import { getContext } from "svelte"
  import InternalTransitionChild from "./InternalTransitionChild.svelte"
  import Transition from "./Transition.svelte"

  const hasTransitionContext = !!getContext("TransitionContext")
  const hasOpenClosedContext = useOpenClosed() !== null

  let { ...props }: TransitionChildProps = $props()
</script>

{#if !hasTransitionContext && hasOpenClosedContext}
  <Transition {...props} />
{:else}
  <InternalTransitionChild {...props} />
{/if}
