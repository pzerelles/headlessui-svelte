/* eslint-disable @typescript-eslint/no-empty-object-type */
// A unique placeholder we can use as a default. This is nice because we can use this instead of
// defaulting to null / never / ... and possibly collide with actual data.

import type { Snippet } from "svelte"
import type { HTMLAttributes, SvelteHTMLElements } from "svelte/elements"

// Ideally we use a unique symbol here.
const __ = "1D45E01E-AF44-47C4-988A-19A94EBAF55C" as const
export type __ = typeof __

export type ElementType = keyof SvelteHTMLElements

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HTMLElementType<T extends keyof SvelteHTMLElements> =
  SvelteHTMLElements[T] extends HTMLAttributes<infer U> ? (U extends HTMLElement ? U : never) : never

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

export type PropsOf<TTag extends keyof SvelteHTMLElements> = TTag extends keyof SvelteHTMLElements
  ? SvelteHTMLElements[TTag]
  : never

type PropsWeControl = "as" | "children" | "class"

// Resolve the props of the component, but ensure to omit certain props that we control
type CleanProps<TTag extends keyof SvelteHTMLElements, TOmittableProps extends PropertyKey = never> = Omit<
  SvelteHTMLElements[TTag],
  TOmittableProps | PropsWeControl
>

// Add certain props that we control
type OurProps<TTag extends keyof SvelteHTMLElements, TSlot> = {
  as?: TTag
  children?: Snippet<[TSlot]>
}

type HasProperty<T extends object, K extends PropertyKey> = T extends never ? never : K extends keyof T ? true : never

// Conditionally override the `class`, to also allow for a function
// if and only if the PropsOf<TTag> already defines `class`.
// This will allow us to have a TS error on as={Fragment}
type ClassNameOverride<TTag extends keyof SvelteHTMLElements, TSlot = {}> =
  // Order is important here, because `never extends true` is `true`...
  true extends HasProperty<PropsOf<TTag>, "class"> ? { class?: PropsOf<TTag>["class"] | ((bag: TSlot) => string) } : {}

// Provide clean TypeScript props, which exposes some of our custom APIs.
export type Props<
  TTag extends keyof SvelteHTMLElements,
  TSlot = {},
  TOmittableProps extends PropertyKey = never,
  Overrides = {},
> = CleanProps<TTag, TOmittableProps | keyof Overrides> &
  OurProps<TTag, TSlot> &
  ClassNameOverride<TTag, TSlot> &
  Overrides

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
export type XOR<T, U> = T | U extends __
  ? never
  : T extends __
    ? U
    : U extends __
      ? T
      : T | U extends object
        ? (Without<T, U> & U) | (Without<U, T> & T)
        : T | U

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnsureArray<T> = T extends any[] ? T : Expand<T>[]
