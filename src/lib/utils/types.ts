/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Snippet } from "svelte"
import type { SvelteHTMLElements } from "svelte/elements"

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

// Provide clean TypeScript props, which exposes some of our custom APIs.
export type Props<
  TTag extends string | Record<string, any>,
  TSlot extends Record<string, any> = {},
  Overrides = {},
> = Omit<TTag extends string ? SvelteHTMLElements[TTag] : TTag, "asChild" | "children" | "class" | keyof Overrides> & {
  asChild?: boolean
  children?: Snippet<[TSlot & { props?: Record<string, any> }]>
  class?: string | null | ((bag: TSlot) => string)
} & Overrides

export type PropsAsChild<TSlot extends Record<string, any> = {}, Overrides = {}> = {
  children?: Snippet<[TSlot & { props?: Record<string, any> }]>
} & Overrides

export type EnsureArray<T> = T extends any[] ? T : Expand<T>[]
