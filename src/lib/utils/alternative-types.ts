import type { Snippet } from "svelte"
import type { SvelteHTMLElements } from "svelte/elements"

export interface SvelteHTMLProps extends SvelteHTMLElements {
  "svelte:fragment": {}
}

export type ElementType = keyof SvelteHTMLProps

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

export type Children<TSlot> = Snippet | Snippet<[TSlot, Record<string, any>]>

// Add certain props that we control
type OurProps<TSlot> = {
  children?: Children<TSlot>
  ref?: HTMLElement
  class?: string | null | ((bag: TSlot) => string)
}

type MergeProps3<T, U, V> = {
  [K in keyof T | keyof U | keyof V]?: K extends keyof V
    ? V[K]
    : K extends keyof U
      ? U[K]
      : K extends keyof T
        ? T[K]
        : never
}

export type Props<
  TTag extends ElementType,
  TSlot = {},
  TOmittableProps extends PropertyKey = never,
  Overrides = {},
> = MergeProps3<SvelteHTMLProps[TTag], OurProps<TSlot>, Overrides>

type OptionalProps<T> = {
  [K in keyof T as {} extends { [P in K]: T[K] } ? K : never]?: T[K]
}

type OptionalKeys<T, U = {}, V = {}> = keyof {
  [K in keyof T as {} extends { [P in K]: T[K] }
    ? K extends keyof U
      ? never
      : K extends keyof V
        ? never
        : K
    : never]?: T[K]
}

type RequiredProps<T> = {
  [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K]
}

type RequiredKeys<T, U = {}, V = {}> = keyof {
  [K in keyof T as T[K] extends Required<T>[K]
    ? K extends keyof U
      ? never
      : K extends keyof V
        ? never
        : K
    : never]: T[K]
}

type MergeRequiredKeys<A, B, C = {}> = RequiredKeys<C> | RequiredKeys<B, C> | RequiredKeys<A, B, C>
type MergeOptionalKeys<A, B, C = {}> = OptionalKeys<C> | OptionalKeys<B, C> | OptionalKeys<A, B, C>

type MergeProps<T, U, V> = {
  [K in MergeRequiredKeys<T, U, V>]: K extends keyof V
    ? V[K]
    : K extends keyof U
      ? U[K]
      : K extends keyof T
        ? T[K]
        : never
} & {
  [K in MergeOptionalKeys<T, U, V>]?: K extends keyof V
    ? V[K]
    : K extends keyof U
      ? U[K]
      : K extends keyof T
        ? T[K]
        : never
}

export type EnsureArray<T> = T extends any[] ? T : Expand<T>[]
