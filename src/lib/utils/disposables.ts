/* eslint-disable @typescript-eslint/no-explicit-any */
import { microTask } from "./microTask.js"

export type Disposables = {
  addEventListener: <TEventName extends keyof WindowEventMap>(
    element: HTMLElement | Window | Document,
    name: TEventName,
    listener: (event: WindowEventMap[TEventName]) => any,
    options?: boolean | AddEventListenerOptions
  ) => () => void
  requestAnimationFrame: (...args: Parameters<typeof requestAnimationFrame>) => () => void
  nextFrame: (...args: Parameters<typeof requestAnimationFrame>) => () => void
  setTimeout: (...args: Parameters<typeof setTimeout>) => () => void
  microTask: (...args: Parameters<typeof microTask>) => () => void
  style: (node: HTMLElement, property: string, value: string) => () => void
  group: (cb: (d: Disposables) => void) => () => void
  add: (cb: () => void) => () => void
  dispose: () => void
}

/**
 * Disposables are a way to manage event handlers and functions like
 * `setTimeout` and `requestAnimationFrame` that need to be cleaned up when they
 * are no longer needed.
 *
 *
 * When you register a disposable function, it is added to a collection of
 * disposables. Each disposable in the collection provides a `dispose` clean up
 * function that can be called when it's no longer needed. There is also a
 * `dispose` function on the collection itself that can be used to clean up all
 * pending disposables in that collection.
 */
export function disposables() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const _disposables: Function[] = []

  const api: Disposables = {
    addEventListener(element, name, listener, options?) {
      element.addEventListener(name, listener as any, options)
      return api.add(() => element.removeEventListener(name, listener as any, options))
    },

    requestAnimationFrame(...args) {
      const raf = requestAnimationFrame(...args)
      return api.add(() => cancelAnimationFrame(raf))
    },

    nextFrame(...args) {
      return api.requestAnimationFrame(() => {
        return api.requestAnimationFrame(...args)
      })
    },

    setTimeout(...args) {
      const timer = setTimeout(...args)
      return api.add(() => clearTimeout(timer))
    },

    microTask(...args) {
      const task = { current: true }
      microTask(() => {
        if (task.current) {
          args[0]()
        }
      })
      return api.add(() => {
        task.current = false
      })
    },

    style(node, property, value) {
      const previous = node.style.getPropertyValue(property)
      Object.assign(node.style, { [property]: value })
      return this.add(() => {
        Object.assign(node.style, { [property]: previous })
      })
    },

    group(cb) {
      const d = disposables()
      cb(d)
      return this.add(() => d.dispose())
    },

    add(cb) {
      // Ensure we don't add the same callback twice
      if (!_disposables.includes(cb)) {
        _disposables.push(cb)
      }

      return () => {
        const idx = _disposables.indexOf(cb)
        if (idx >= 0) {
          for (const dispose of _disposables.splice(idx, 1)) {
            dispose()
          }
        }
      }
    },

    dispose() {
      for (const dispose of _disposables.splice(0)) {
        dispose()
      }
    },
  }

  return api
}

export { disposables as useDisposables }
