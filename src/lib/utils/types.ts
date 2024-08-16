import type { Snippet } from "svelte"
import type { SvelteHTMLElements } from "svelte/elements"

export interface SvelteHTMLProps extends SvelteHTMLElements {
  "svelte:fragment": {}
}

export type ElementType = keyof SvelteHTMLProps

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

export type PropsOf<TTag extends ElementType> = SvelteHTMLProps[TTag]

export type Children<TSlot> = Snippet | Snippet<[TSlot, Record<string, any>]>

type PropsWeControl = "as" | "children" | "refName" | "className"

// Resolve the props of the component, but ensure to omit certain props that we control
type CleanProps<TTag extends ElementType, TOmittableProps extends PropertyKey = never> = Omit<
  PropsOf<TTag>,
  TOmittableProps | PropsWeControl
>

// Add certain props that we control
type OurProps<TTag extends ElementType, TSlot> = {
  children?: Children<TSlot>
  ref?: HTMLElement
}

type HasProperty<T extends object, K extends PropertyKey> = T extends never ? never : K extends keyof T ? true : never

// Conditionally override the `className`, to also allow for a function
// if and only if the PropsOf<TTag> already defines `className`.
// This will allow us to have a TS error on as={Fragment}
type ClassNameOverride<TTag extends ElementType, TSlot = {}> =
  // Order is important here, because `never extends true` is `true`...
  true extends HasProperty<PropsOf<TTag>, "className">
    ? { className?: PropsOf<TTag>["className"] | ((bag: TSlot) => string) }
    : {}

// Provide clean TypeScript props, which exposes some of our custom APIs.
export type Props<
  TTag extends ElementType,
  TSlot = {},
  TOmittableProps extends PropertyKey = never,
  Overrides = {},
> = CleanProps<TTag, TOmittableProps | keyof Overrides> &
  OurProps<TTag, TSlot> &
  ClassNameOverride<TTag, TSlot> &
  Overrides

export type EnsureArray<T> = T extends any[] ? T : Expand<T>[]
