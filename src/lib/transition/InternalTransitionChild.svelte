<script lang="ts" module>
  import { compact, RenderStrategy } from "$lib/utils/render.js"
  import { onMount, setContext, untrack } from "svelte"
  import {
    hasChildren,
    TreeStates,
    useNesting,
    useParentNesting,
    useTransitionContext,
    type NestingContextValues,
    type TransitionDirection,
  } from "./context.svelte.js"
  import type { TransitionRootProps } from "./Transition.svelte"
  import { match } from "$lib/utils/match.js"
  import { transitionDataAttributes, useTransition } from "$lib/hooks/use-transition.svelte.js"
  import { classNames } from "$lib/utils/class-names.js"
  import { createOpenClosedContext, State } from "$lib/internal/open-closed.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { DEFAULT_TRANSITION_CHILD_TAG, type TransitionChildProps } from "./TransitionChild.svelte"

  /**
   * Check if we should forward the ref to the child element or not. This is to
   * prevent crashes when the `as` prop is a Fragment _and_ the component just acts
   * as a state container (aka, there is no actual transition happening).
   *
   * E.g.:
   *
   * ```tsx
   * <Transition show={true}>
   *   <Transition.Child enter="duration-100"><div>Child 1</div></Transition.Child>
   *   <Transition.Child enter="duration-200"><div>Child 2</div></Transition.Child>
   * </Transition>
   * ```
   *
   * In this scenario, the child components are transitioning, but the
   * `Transition` parent, which is a `Fragment`, is not. So we should not forward
   * the ref to the `Fragment`.
   */
  export function shouldForwardRef(props: TransitionRootProps) {
    return (
      // If we have any of the enter/leave classes
      Boolean(props.enter || props.enterFrom || props.enterTo || props.leave || props.leaveFrom || props.leaveTo) ||
      // If the `as` prop is not a Fragment
      !props.asChild ||
      // If we have a single child, then we can forward the ref directly
      props.children !== undefined
    )
  }
</script>

<script lang="ts">
  let { element = $bindable(), ..._props }: TransitionChildProps = $props()
  const {
    // Whether or not to enable transitions on the current element (by exposing
    // transition data). When set to false, the `Transition` component still
    // acts as a transition boundary for `TransitionChild` components.
    transition = true,

    // Event "handlers"
    beforeEnter,
    afterEnter,
    beforeLeave,
    afterLeave,

    // Class names
    enter,
    enterFrom,
    enterTo,
    entered,
    leave,
    leaveFrom,
    leaveTo,

    ...theirProps
  } = $derived(_props)
  let containerElement = $state<HTMLElement>()
  let container = $state<{ current: HTMLElement | null }>({ current: null })
  const requiresRef = $derived(shouldForwardRef(_props as TransitionRootProps))

  const strategy = $derived((theirProps.unmount ?? true) ? RenderStrategy.Unmount : RenderStrategy.Hidden)

  const _transitionContext = useTransitionContext()
  const { show, appear, initial } = $derived(_transitionContext)

  let _state = $state(untrack(() => show) ? TreeStates.Visible : TreeStates.Hidden)

  const parentNesting = useParentNesting()
  const { register, unregister } = $derived(parentNesting)

  onMount(() => {
    if (requiresRef) {
      container.current = element ?? null
      containerElement = element
    }

    return register(container)
  })

  $effect(() => {
    // If we are in another mode than the Hidden mode then ignore
    if (strategy !== RenderStrategy.Hidden) return
    if (!container.current) return

    // Make sure that we are visible
    if (show && _state !== TreeStates.Visible) {
      _state = TreeStates.Visible
      return
    }

    match(_state, {
      [TreeStates.Hidden]: () => unregister(container),
      [TreeStates.Visible]: () => register(container),
    })
  })
  //[state, container, register, unregister, show, strategy]

  $effect(() => {
    if (!requiresRef) return

    if (_state === TreeStates.Visible && container.current === null) {
      throw new Error("Did you forget to passthrough the `ref` to the actual DOM node?")
    }
  })

  // Skipping initial transition
  const skip = $derived(initial && !appear)
  const immediate = $derived(appear && show && initial)

  let isTransitioning = $state(false)

  let nesting = useNesting({
    done: () => {
      // When all children have been unmounted we can only hide ourselves if and
      // only if we are not transitioning ourselves. Otherwise we would unmount
      // before the transitions are finished.
      if (isTransitioning) return

      _state = TreeStates.Hidden
      unregister(container)
    },
    get parent() {
      return parentNesting
    },
  })

  const start = (show: boolean) => {
    isTransitioning = true
    const direction: TransitionDirection = show ? "enter" : "leave"

    nesting.onStart(container, direction, (direction) => {
      if (direction === "enter") beforeEnter?.()
      else if (direction === "leave") beforeLeave?.()
    })
  }

  const end = (show: boolean) => {
    let direction: TransitionDirection = show ? "enter" : "leave"

    isTransitioning = false
    nesting.onStop(container, direction, (direction) => {
      if (direction === "enter") afterEnter?.()
      else if (direction === "leave") afterLeave?.()
    })

    if (direction === "leave" && !hasChildren(nesting)) {
      // When we don't have children anymore we can safely unregister from the
      // parent and hide ourselves.
      _state = TreeStates.Hidden
      unregister(container)
    }
  }

  $effect(() => {
    if (requiresRef && transition) return

    // When we don't transition, then we can complete the transition
    // immediately.
    untrack(() => start(show))
    untrack(() => end(show))
  })

  const enabled = $derived.by(() => {
    // Should the current component transition? If not, then we can still
    // orchestrate the child transitions.
    if (!transition) return false

    // If we don't require a ref, then we can't transition.
    if (!requiresRef) return false

    // If the server handoff isn't completed yet, we can't transition.
    //if (!ready) return false

    // If we start in a `show` state but without the `appear` prop, then we skip
    // the initial transition.
    if (skip) return false

    return true
  })

  // Ignoring the `visible` state because this doesn't handle the hierarchy. If
  // a leave transition on the `<Transition>` is done, but there is still a
  // child `<TransitionChild>` busy, then `visible` would be `false`, while
  // `state` would still be `TreeStates.Visible`.
  const _transition = useTransition({
    get enabled() {
      return enabled
    },
    get element() {
      return containerElement
    },
    get show() {
      return show
    },
    events: { start, end },
  })
  const { data: transitionData } = $derived(_transition)

  const ourProps = $derived(
    compact({
      class:
        classNames(
          // Incoming classes if any
          // all components accept className (but all HTML elements do)
          theirProps.asChild
            ? undefined
            : typeof theirProps.class === "function"
              ? theirProps.class({ element })
              : theirProps.class,

          // Apply these classes immediately
          immediate && enter,
          immediate && enterFrom,

          // Map data attributes to `enter`, `enterFrom` and `enterTo` classes
          transitionData.enter && enter,
          transitionData.enter && transitionData.closed && enterFrom,
          transitionData.enter && !transitionData.closed && enterTo,

          // Map data attributes to `leave`, `leaveFrom` and `leaveTo` classes
          transitionData.leave && leave,
          transitionData.leave && !transitionData.closed && leaveFrom,
          transitionData.leave && transitionData.closed && leaveTo,

          // Map data attributes to `entered` class (backwards compatibility)
          !transitionData.transition && show && entered
        )?.trim() || undefined, // If `class` is an empty string, we can omit it
      ...transitionDataAttributes(transitionData),
    })
  )

  const openClosedState = $derived.by(() => {
    let openClosedState = 0
    if (_state === TreeStates.Visible) openClosedState |= State.Open
    if (_state === TreeStates.Hidden) openClosedState |= State.Closed
    if (transitionData.enter) openClosedState |= State.Opening
    if (transitionData.leave) openClosedState |= State.Closing
    return openClosedState
  })

  createOpenClosedContext({
    get value() {
      return openClosedState
    },
  })
  setContext<NestingContextValues>("NestingContext", nesting)
</script>

<ElementOrComponent
  {ourProps}
  {theirProps}
  defaultTag={DEFAULT_TRANSITION_CHILD_TAG}
  name="TransitionChild"
  bind:element
/>
