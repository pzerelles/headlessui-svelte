export enum RenderFeatures {
  /** No features at all */
  None = 0,

  /**
   * When used, this will allow us to use one of the render strategies.
   *
   * **The render strategies are:**
   *    - **Unmount**   _(Will unmount the component.)_
   *    - **Hidden**    _(Will hide the component using the [hidden] attribute.)_
   */
  RenderStrategy = 1,

  /**
   * When used, this will allow the user of our component to be in control. This can be used when
   * you want to transition based on some state.
   */
  Static = 2,
}

export enum RenderStrategy {
  Unmount,
  Hidden,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never

type PropsForFeature<
  TPassedInFeatures extends RenderFeatures,
  TForFeature extends RenderFeatures,
  TProps,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
> = TPassedInFeatures extends TForFeature ? TProps : {}

export type PropsForFeatures<T extends RenderFeatures> = Expand<
  UnionToIntersection<
    | PropsForFeature<T, RenderFeatures.Static, { static?: boolean }>
    | PropsForFeature<T, RenderFeatures.RenderStrategy, { unmount?: boolean }>
  >
>
