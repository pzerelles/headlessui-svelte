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
  import InternalTransitionChild from "./InternalTransitionChild.svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import {
    hasChildren,
    TreeStates,
    useNesting,
    type NestingContextValues,
    type TransitionContextValues,
  } from "./context.svelte.js"

  let { element = $bindable(), show, ..._props }: TransitionRootProps = $props()
  const { appear = false, unmount = true, ...theirProps } = $derived(_props)

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
    } else if (!hasChildren(nestingBag) && untrack(() => element)) {
      _state = TreeStates.Hidden
    }
  })

  const sharedProps = $derived({ unmount })

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

{#snippet children()}
  <InternalTransitionChild bind:element {...sharedProps} {...theirProps} {beforeEnter} {beforeLeave} />
{/snippet}

<ElementOrComponent
  ourProps={{
    ...sharedProps,
    children,
  }}
  theirProps={{}}
  defaultTag={"svelte:fragment"}
  features={TransitionChildRenderFeatures}
  visible={_state === TreeStates.Visible}
  name="Transition"
/>
