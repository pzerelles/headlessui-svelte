/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { Snippet } from "svelte"
import type { SvelteHTMLElements } from "svelte/elements"

export type ElementType = keyof SvelteHTMLElements

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

export type PropsOf<TTag extends ElementType> = SvelteHTMLElements[TTag]

type PropsWeControl = "as" | "children" | "class" | "ref" | "slot"

// Resolve the props of the component, but ensure to omit certain props that we control
type CleanProps<TTag extends ElementType, TOmittableProps extends PropertyKey = never> = Omit<
  PropsOf<TTag>,
  TOmittableProps | PropsWeControl
>

// Add certain props that we control
type OurProps<TSlot extends Record<string, any>> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: Snippet<[TSlot & { props?: Record<string, any> }]>
  class?: string | null | ((bag: TSlot) => string)
  ref?: HTMLElement
}

// Provide clean TypeScript props, which exposes some of our custom APIs.
export type Props<
  TTag extends ElementType,
  TSlot extends Record<string, any> = {},
  TOmittableProps extends PropertyKey = never,
  Overrides = {},
> = CleanProps<TTag, TOmittableProps | keyof Overrides> & OurProps<TSlot> & Overrides

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnsureArray<T> = T extends any[] ? T : Expand<T>[]
