/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MutableRefObject } from "../../../utils/ref.svelte.js"
import type { HTMLAttributes } from "svelte/elements"
import type {
  UseFloatingOptions as UsePositionOptions,
  UseFloatingReturn as UsePositionFloatingReturn,
  VirtualElement,
} from "../svelte-dom/types.js"

import type { ExtendedUserProps } from "./hooks/useInteractions.svelte.js"

export type {
  ReferenceElement,
  DetectOverflowOptions,
  Middleware,
  MiddlewareState,
  SideObject,
} from "../svelte-dom/types.js"

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type OpenChangeReason =
  | "outside-press"
  | "escape-key"
  | "ancestor-scroll"
  | "reference-press"
  | "click"
  | "hover"
  | "focus"
  | "focus-out"
  | "list-navigation"
  | "safe-polygon"

export type NarrowedElement<T> = T extends Element ? T : Element

export interface ExtendedRefs<RT> {
  reference: MutableRefObject<ReferenceType | null>
  floating: MutableRefObject<HTMLElement | null>
  domReference: MutableRefObject<NarrowedElement<RT> | null>
  setReference(node: RT | null | undefined): void
  setFloating(node: HTMLElement | null | undefined): void
  setPositionReference(node: ReferenceType | null | undefined): void
}

export interface ExtendedElements<RT> {
  reference: ReferenceType | null
  floating: HTMLElement | null
  domReference: NarrowedElement<RT> | null
}

export interface FloatingEvents {
  emit<T extends string>(event: T, data?: any): void
  on(event: string, handler: (data: any) => void): void
  off(event: string, handler: (data: any) => void): void
}

export interface ContextData {
  openEvent?: Event
  floatingContext?: FloatingContext
  /** @deprecated use `onTypingChange` prop in `useTypeahead` */
  typing?: boolean
  [key: string]: any
}

export interface FloatingRootContext<RT extends ReferenceType = ReferenceType> {
  dataRef: MutableRefObject<ContextData>
  open: boolean
  onOpenChange: (open: boolean, event?: Event, reason?: OpenChangeReason) => void
  elements: {
    domReference: Element | null
    reference: RT | null
    floating: HTMLElement | null
  }
  events: FloatingEvents
  floatingId: string
  refs: {
    setPositionReference(node: ReferenceType | null | undefined): void
  }
}

export type FloatingContext<RT extends ReferenceType = ReferenceType> = Omit<
  UsePositionFloatingReturn<RT>,
  "refs" | "elements"
> & {
  open: boolean
  onOpenChange(open: boolean, event?: Event, reason?: OpenChangeReason): void
  events: FloatingEvents
  dataRef: MutableRefObject<ContextData>
  nodeId: string | undefined
  floatingId: string
  refs: ExtendedRefs<RT>
  elements: ExtendedElements<RT>
}

export interface FloatingNodeType<RT extends ReferenceType = ReferenceType> {
  id: string
  parentId: string | null
  context?: FloatingContext<RT>
}

export interface FloatingTreeType<RT extends ReferenceType = ReferenceType> {
  nodesRef: MutableRefObject<Array<FloatingNodeType<RT>>>
  events: FloatingEvents
  addNode(node: FloatingNodeType): void
  removeNode(node: FloatingNodeType): void
}

export interface ElementProps {
  reference?: HTMLAttributes<Element>
  floating?: HTMLAttributes<HTMLElement>
  item?: HTMLAttributes<HTMLElement> | ((props: ExtendedUserProps) => HTMLAttributes<HTMLElement>)
}

export type ReferenceType = Element | VirtualElement

export type UseFloatingData = Prettify<UseFloatingReturn>

export type UseFloatingReturn<RT extends ReferenceType = ReferenceType> = Prettify<
  UsePositionFloatingReturn & {
    /**
     * `FloatingContext`
     */
    context: Prettify<FloatingContext<RT>>
    /**
     * Object containing the reference and floating refs and reactive setters.
     */
    refs: ExtendedRefs<RT>
    elements: ExtendedElements<RT>
  }
>

export interface UseFloatingOptions<RT extends ReferenceType = ReferenceType>
  extends Omit<UsePositionOptions<RT>, "elements"> {
  rootContext?: FloatingRootContext<RT>
  /**
   * Object of external elements as an alternative to the `refs` object setters.
   */
  elements?: {
    /**
     * Externally passed reference element. Store in state.
     */
    reference?: Element | null
    /**
     * Externally passed floating element. Store in state.
     */
    floating?: HTMLElement | null
  }
  /**
   * An event callback that is invoked when the floating element is opened or
   * closed.
   */
  onOpenChange?(open: boolean, event?: Event, reason?: OpenChangeReason): void
  /**
   * Unique node id when using `FloatingTree`.
   */
  nodeId?: string
}
