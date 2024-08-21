<script lang="ts" context="module">
  import { State, useOpenClosed } from "$lib/internal/open-closed.js"
  import type { ElementType } from "$lib/utils/types.js"
  import { setContext, getContext, untrack, type Component } from "svelte"
  import {
    type TransitionChildProps,
    DEFAULT_TRANSITION_CHILD_TAG,
    TransitionChildRenderFeatures,
  } from "./TransitionChild.svelte"
  import { useIsMounted } from "$lib/hooks/use-is-mounted.svelte.js"
  import { useDisposables } from "$lib/utils/disposables.js"
  import { match } from "$lib/utils/match.js"
  import type { MutableRefObject } from "$lib/utils/ref.svelte.js"
  import { RenderStrategy } from "$lib/utils/render.js"

  type ContainerElement = MutableRefObject<HTMLElement | null>

  export type TransitionDirection = "enter" | "leave"

  export interface TransitionContextValues {
    show: boolean
    appear: boolean
    initial: boolean
  }

  export enum TreeStates {
    Visible = "visible",
    Hidden = "hidden",
  }

  export interface TransitionClasses {
    enter?: string
    enterFrom?: string
    enterTo?: string
    /**
     * @deprecated The `enterTo` and `leaveTo` classes stay applied after the transition has finished.
     */
    entered?: string
    leave?: string
    leaveFrom?: string
    leaveTo?: string
  }

  export interface TransitionEvents {
    beforeEnter?: () => void
    afterEnter?: () => void
    beforeLeave?: () => void
    afterLeave?: () => void
  }

  export function useTransitionContext() {
    const context = getContext<TransitionContextValues>("TransitionContext")

    if (context === null) {
      throw new Error(
        "A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />."
      )
    }

    return context
  }

  export function useParentNesting() {
    let context = getContext<NestingContextValues>("NestingContext")

    if (context === null) {
      throw new Error(
        "A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />."
      )
    }

    return context
  }

  export interface NestingContextValues {
    children: { el: ContainerElement; state: TreeStates }[]
    register: (el: ContainerElement) => () => void
    unregister: (el: ContainerElement, strategy?: RenderStrategy) => void
    onStart: (el: ContainerElement, direction: TransitionDirection, cb: () => void) => void
    onStop: (el: ContainerElement, direction: TransitionDirection, cb: () => void) => void
    chains: Record<TransitionDirection, [container: ContainerElement, promise: Promise<void>][]>
    wait: Promise<void>
  }

  export function hasChildren(
    bag: NestingContextValues["children"] | { children: NestingContextValues["children"] }
  ): boolean {
    if ("children" in bag) return hasChildren(bag.children)
    return bag.filter(({ state }) => state === TreeStates.Visible).length > 0
  }

  export function useNesting(options: { done?: () => void; parent?: NestingContextValues }) {
    const { done, parent } = $derived(options)
    let transitionableChildren = $state<NestingContextValues["children"]>([])
    const mounted = useIsMounted()
    const d = useDisposables()

    const unregister = (container: ContainerElement, strategy = RenderStrategy.Hidden) => {
      const idx = transitionableChildren.findIndex(({ el }) => el === container)
      if (idx === -1) return

      match(strategy, {
        [RenderStrategy.Unmount]() {
          transitionableChildren.splice(idx, 1)
        },
        [RenderStrategy.Hidden]() {
          transitionableChildren[idx].state = TreeStates.Hidden
        },
      })

      d.microTask(() => {
        if (!hasChildren(transitionableChildren) && mounted.current) {
          done?.()
        }
      })
    }

    const register = (container: ContainerElement) => {
      const child = transitionableChildren.find(({ el }) => el === container)
      if (!child) {
        transitionableChildren.push({ el: container, state: TreeStates.Visible })
      } else if (child.state !== TreeStates.Visible) {
        child.state = TreeStates.Visible
      }

      return () => unregister(container, RenderStrategy.Unmount)
    }

    let todos = $state<(() => void)[]>([])
    let wait = $state<Promise<void>>(Promise.resolve())

    let chains = $state<Record<TransitionDirection, [identifier: ContainerElement, promise: Promise<void>][]>>({
      enter: [],
      leave: [],
    })

    let onStart = (
      container: ContainerElement,
      direction: TransitionDirection,
      cb: (direction: TransitionDirection) => void
    ) => {
      // Clear out all existing todos
      todos.splice(0)

      // Remove all existing promises for the current container from the parent because we can
      // ignore those and use only the new one.
      if (parent) {
        parent.chains[direction] = parent.chains[direction].filter(
          ([containerInParent]) => containerInParent !== container
        )
      }

      // Wait until our own transition is done
      parent?.chains[direction].push([
        container,
        new Promise<void>((resolve) => {
          todos.push(resolve)
        }),
      ])

      // Wait until our children are done
      parent?.chains[direction].push([
        container,
        new Promise<void>((resolve) => {
          Promise.all(chains[direction].map(([_container, promise]) => promise)).then(() => resolve())
        }),
      ])

      if (direction === "enter") {
        wait = wait.then(() => parent?.wait).then(() => cb(direction))
      } else {
        cb(direction)
      }
    }

    const onStop = (
      _container: ContainerElement,
      direction: TransitionDirection,
      cb: (direction: TransitionDirection) => void
    ) => {
      Promise.all(chains[direction].splice(0).map(([_container, promise]) => promise)) // Wait for my children
        .then(() => {
          todos.shift()?.() // I'm ready
        })
        .then(() => cb(direction))
    }

    return {
      get children() {
        return transitionableChildren
      },
      register,
      unregister,
      onStart,
      onStop,
      get wait() {
        return wait
      },
      get chains() {
        return chains
      },
    }
  }

  export type TransitionRootProps<TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG> =
    TransitionChildProps<TTag> & {
      show?: boolean
      appear?: boolean
    }
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG">
  import InternalTransitionChild, { shouldForwardRef } from "./InternalTransitionChild.svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  let { ref = $bindable(), show, ..._props }: { as?: TTag } & TransitionRootProps<TTag> = $props()
  const { appear = false, unmount = true, ...theirProps } = $derived(_props)
  const requiresRef = shouldForwardRef(_props)

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

  const InternalChild = InternalTransitionChild as Component<TransitionChildProps<TTag>, any>
</script>

{#snippet internalChildren()}
  <InternalChild bind:ref {...sharedProps} {...theirProps} {beforeEnter} {beforeLeave} />
{/snippet}

<ElementOrComponent
  ourProps={{
    ...sharedProps,
    children: internalChildren,
  }}
  theirProps={{}}
  defaultTag={"svelte:fragment"}
  features={TransitionChildRenderFeatures}
  visible={_state === TreeStates.Visible}
  name="Transition"
/>
