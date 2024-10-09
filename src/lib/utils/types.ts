/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { Component, Snippet } from "svelte"
import type { SvelteHTMLElements } from "svelte/elements"

export type ElementType = Component<any, any> | string | undefined

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

type PropsWeControl = "as" | "children" | "class" | "element"

// Provide clean TypeScript props, which exposes some of our custom APIs.
export type Props<
  TTag extends Component<any, any> | string | undefined,
  FallbackProps = {},
  TSlot = {},
  TOmittableProps extends PropertyKey = never,
  Overrides = {},
> = (TTag extends Component<infer Props, any>
  ? Omit<Props, TOmittableProps | PropsWeControl | keyof Overrides>
  : TTag extends string
    ? Omit<SvelteHTMLElements[TTag], TOmittableProps | PropsWeControl | keyof Overrides>
    : Omit<FallbackProps, TOmittableProps | PropsWeControl | keyof Overrides>) & {
  as?: TTag
  children?: Snippet<[TSlot & { props?: Record<string, any> }]>
  class?: string | null | ((bag: TSlot) => string)
  element?: HTMLElement
} & Overrides

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnsureArray<T> = T extends any[] ? T : Expand<T>[]
