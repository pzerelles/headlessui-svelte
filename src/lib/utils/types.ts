/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { Snippet } from "svelte"
import type { SvelteHTMLElements } from "svelte/elements"

export interface SvelteHTMLProps extends SvelteHTMLElements {
  "svelte:fragment": {}
}

export type ElementType = keyof SvelteHTMLProps

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

export type PropsOf<TTag extends ElementType> = SvelteHTMLProps[TTag]

// Resolve the props of the component, but ensure to omit certain props that we control
type CleanProps<TTag extends ElementType, TOmittableProps extends PropertyKey = never> = Omit<
  SvelteHTMLElements[TTag],
  TOmittableProps | "children" | "class"
>

// Add certain props that we control
type OurProps<TSlot> = {
  children?: Snippet<[{ slot: TSlot; props?: Record<string, any> }]>
  class?: string | null | ((bag: TSlot) => string)
}

// Provide clean TypeScript props, which exposes some of our custom APIs.
export type Props<
  TTag extends keyof SvelteHTMLElements,
  TSlot = {},
  TOmittableProps extends PropertyKey = never,
  Overrides = {},
> = CleanProps<TTag, TOmittableProps | keyof Overrides | keyof OurProps<TSlot>> & OurProps<TSlot> & Overrides

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnsureArray<T> = T extends any[] ? T : Expand<T>[]
