<script lang="ts" module>
  import { State, useOpenClosed } from "$lib/internal/open-closed.js"
  import { setContext, untrack } from "svelte"
  import { type TransitionChildProps, TransitionChildRenderFeatures } from "./TransitionChild.svelte"

  export type TransitionRootProps = TransitionChildProps & {
    show?: boolean
    appear?: boolean
  }
</script>

<script lang="ts">
  import InternalTransitionChild, { shouldForwardRef } from "./InternalTransitionChild.svelte"
  import {
    hasChildren,
    TreeStates,
    useNesting,
    type NestingContextValues,
    type TransitionContextValues,
  } from "./context.svelte.js"
  import { renderProps } from "$lib/utils/render.js"

  let { ref, show, ..._props }: TransitionRootProps = $props()
  const { appear = false, unmount = true, ...theirProps } = $derived(_props)
  //const requiresRef = shouldForwardRef(_props)

  const usesOpenClosedState = useOpenClosed()

  if (show === undefined && usesOpenClosedState !== null) {
    show = (usesOpenClosedState.value & State.Open) === State.Open
  }

  if (show === undefined) {
    throw new Error("A <Transition /> is used but it is missing a `show={true | false}` prop.")
  }

  let _state = $state(show ? TreeStates.Visible : TreeStates.Hidden)

  const nestingBag = useNesting({
    done: () => {
      if (show) return
      _state = TreeStates.Hidden
    },
  })

  let initial = $state(true)

  // Change the `initial` value
  let changes = $state([show])
  $effect(() => {
    // We can skip this effect
    if (untrack(() => initial) === false) {
      return
    }

    // Track the changes
    if (changes[changes.length - 1] !== show) {
      changes.push(show)
      initial = false
    }
  })

  $effect(() => {
    if (show) {
      _state = TreeStates.Visible
    } else if (!hasChildren(nestingBag) && untrack(() => ref)) {
      _state = TreeStates.Hidden
    }
  })

  const sharedProps = $derived({ unmount })

  const ourProps = $derived(
    renderProps([sharedProps], {
      features: TransitionChildRenderFeatures,
      visible: _state === TreeStates.Visible,
    })
  )

  const beforeEnter = () => {
    if (initial) initial = false
    _props.beforeEnter?.()
  }

  const beforeLeave = () => {
    if (initial) initial = false
    _props.beforeLeave?.()
  }

  setContext<NestingContextValues>("NestingContext", nestingBag)
  setContext<TransitionContextValues>("TransitionContext", {
    get show() {
      return show
    },
    get appear() {
      return appear
    },
    get initial() {
      return initial
    },
  })
</script>

{#if ourProps}
  <InternalTransitionChild {...sharedProps} {...theirProps} {beforeEnter} {beforeLeave} {ref} asChild={!!ref} />
{/if}
