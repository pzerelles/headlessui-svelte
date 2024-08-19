/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Props } from "./types.js"

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

export function mergeProps<T extends Props<any, any>[]>(...listOfProps: T) {
  if (listOfProps.length === 0) return {}
  if (listOfProps.length === 1) return listOfProps[0]

  let target: Props<any, any> = {}

  let eventHandlers: Record<string, ((...args: any[]) => void | undefined)[]> = {}

  for (let props of listOfProps) {
    for (let prop in props) {
      // Merge event listeners
      if (prop.startsWith("on") && typeof props[prop] === "function") {
        eventHandlers[prop] ??= []
        eventHandlers[prop].push(props[prop])
      } else {
        // Override incoming prop
        target[prop] = props[prop]
      }
    }
  }

  // Merge event handlers
  for (let eventName in eventHandlers) {
    Object.assign(target, {
      [eventName](...args: any[]) {
        let handlers = eventHandlers[eventName]

        for (let handler of handlers) {
          handler?.(...args)
        }
      },
    })
  }

  return target
}

// A more complex example fo the `mergeProps` function, this one also cancels subsequent event
// listeners if the event has already been `preventDefault`ed.
export function mergePropsAdvanced(...listOfProps: Props<any, any>[]) {
  if (listOfProps.length === 0) return {}
  if (listOfProps.length === 1) return listOfProps[0]

  let target: Props<any, any> = {}

  let eventHandlers: Record<string, ((event: { defaultPrevented: boolean }, ...args: any[]) => void | undefined)[]> = {}

  for (let props of listOfProps) {
    for (let prop in props) {
      // Collect event handlers
      if (prop.startsWith("on") && typeof props[prop] === "function") {
        eventHandlers[prop] ??= []
        eventHandlers[prop].push(props[prop])
      } else {
        // Override incoming prop
        target[prop] = props[prop]
      }
    }
  }

  // Ensure event listeners are not called if `disabled` or `aria-disabled` is true
  if (target.disabled || target["aria-disabled"]) {
    for (let eventName in eventHandlers) {
      // Prevent default events for `onclick`, `onmousedown`, `onkeydown`, etc.
      if (/^(on(?:click|pointer|mouse|key)(?:down|up|press)?)$/.test(eventName)) {
        eventHandlers[eventName] = [(e: any) => e?.preventDefault?.()]
      }
    }
  }

  // Merge event handlers
  for (let eventName in eventHandlers) {
    Object.assign(target, {
      [eventName](event: { nativeEvent?: Event; defaultPrevented: boolean }, ...args: any[]) {
        let handlers = eventHandlers[eventName]

        for (let handler of handlers) {
          if ((event instanceof Event || event?.nativeEvent instanceof Event) && event.defaultPrevented) {
            return
          }

          handler(event, ...args)
        }
      },
    })
  }

  return target
}

export function compact<T extends Record<any, any>>(object: T) {
  let clone = Object.assign({}, object)
  for (let key in clone) {
    if (clone[key] === undefined) delete clone[key]
  }
  return clone
}

export function omit<T extends Record<any, any>>(object: T, keysToOmit: string[] = []) {
  let clone = Object.assign({}, object) as T
  for (let key of keysToOmit) {
    if (key in clone) delete clone[key]
  }
  return clone
}
