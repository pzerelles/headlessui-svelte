import type { MockInstance } from "vitest"
import { vitest } from "vitest"

type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T] &
  string

export function suppressConsoleLogs<T extends unknown[]>(
  cb: (...args: T) => unknown,
  type: FunctionPropertyNames<typeof globalThis.console> = "error"
) {
  return (...args: T) => {
    let spy = vitest.spyOn(globalThis.console, type).mockImplementation(vitest.fn())

    return new Promise<unknown>((resolve, reject) => {
      Promise.resolve(cb(...args)).then(resolve, reject)
    }).finally(() => spy.mockRestore())
  }
}

export function mockingConsoleLogs<T extends unknown[]>(
  cb: (spy: MockInstance, ...args: T) => unknown,
  type: FunctionPropertyNames<typeof globalThis.console> = "error"
) {
  return (...args: T) => {
    let spy = vitest.spyOn(globalThis.console, type).mockImplementation(vitest.fn())

    return new Promise<unknown>((resolve, reject) => {
      Promise.resolve(cb(spy, ...args)).then(resolve, reject)
    }).finally(() => spy.mockRestore())
  }
}
