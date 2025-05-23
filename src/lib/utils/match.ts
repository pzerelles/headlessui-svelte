/* eslint-disable @typescript-eslint/no-explicit-any */
export function match<TValue extends string | number = string, TReturnValue = unknown>(
  value: TValue,
  lookup: Record<TValue, TReturnValue | ((...args: any[]) => TReturnValue)>,
  ...args: any[]
): TReturnValue {
  if (value in lookup) {
    const returnValue: TReturnValue | ((...args: any[]) => TReturnValue) = lookup[value]
    return typeof returnValue === "function" ? (returnValue as (...args: any[]) => TReturnValue)(...args) : returnValue
  }

  const error = new Error(
    `Tried to handle "${value}" but there is no handler defined. Only defined handlers are: ${Object.keys(lookup)
      .map((key) => `"${key}"`)
      .join(", ")}.`
  )
  if (Error.captureStackTrace) Error.captureStackTrace(error, match)
  throw error
}
