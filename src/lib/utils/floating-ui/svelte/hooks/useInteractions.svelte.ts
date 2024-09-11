import type { HTMLAttributes } from "svelte/elements"
import type { ElementProps } from "../types.js"
import { FOCUSABLE_ATTRIBUTE } from "../utils/getFloatingFocusElement.js"

const ACTIVE_KEY = "active"
const SELECTED_KEY = "selected"

export type ExtendedUserProps = {
  [ACTIVE_KEY]?: boolean
  [SELECTED_KEY]?: boolean
}

function mergeProps<Key extends keyof ElementProps>(
  userProps: ((HTMLAttributes<Element> | HTMLAttributes<HTMLElement>) & ExtendedUserProps) | undefined,
  propsList: Array<ElementProps | void>,
  elementKey: Key
): Record<string, unknown> {
  const map = new Map<string, Array<(...args: unknown[]) => unknown>>()
  const isItem = elementKey === "item"

  let domUserProps = userProps
  if (isItem && userProps) {
    const { [ACTIVE_KEY]: _, [SELECTED_KEY]: __, ...validProps } = userProps
    domUserProps = validProps
  }

  return {
    ...(elementKey === "floating" && {
      tabIndex: -1,
      [FOCUSABLE_ATTRIBUTE]: "",
    }),
    ...domUserProps,
    ...propsList
      .map((value) => {
        const propsOrGetProps = value ? value[elementKey] : null
        if (typeof propsOrGetProps === "function") {
          return userProps ? propsOrGetProps(userProps) : null
        }
        return propsOrGetProps
      })
      .concat(userProps)
      .reduce((acc: Record<string, unknown>, props) => {
        if (!props) {
          return acc
        }

        Object.entries(props).forEach(([key, value]) => {
          if (isItem && [ACTIVE_KEY, SELECTED_KEY].includes(key)) {
            return
          }

          if (key.indexOf("on") === 0) {
            if (!map.has(key)) {
              map.set(key, [])
            }

            if (typeof value === "function") {
              map.get(key)?.push(value as (...args: unknown[]) => unknown)

              acc[key] = (...args: unknown[]) => {
                return map
                  .get(key)
                  ?.map((fn) => fn(...args))
                  .find((val) => val !== undefined)
              }
            }
          } else {
            acc[key] = value
          }
        })

        return acc
      }, {}),
  }
}

export interface UseInteractionsReturn {
  getReferenceProps: (userProps?: HTMLAttributes<Element>) => Record<string, unknown>
  getFloatingProps: (userProps?: HTMLAttributes<HTMLElement>) => Record<string, unknown>
  getItemProps: (
    userProps?: Omit<HTMLAttributes<HTMLElement>, "selected" | "active"> & ExtendedUserProps
  ) => Record<string, unknown>
}

/**
 * Merges an array of interaction hooks' props into prop getters, allowing
 * event handler functions to be composed together without overwriting one
 * another.
 * @see https://floating-ui.com/docs/useInteractions
 */
export function useInteractions(
  options: { propsList: Array<ElementProps | void> } = { propsList: [] }
): UseInteractionsReturn {
  const { propsList } = $derived(options)
  //const referenceDeps = $derived(propsList.map((key) => key?.reference))
  //const floatingDeps = $derived(propsList.map((key) => key?.floating))
  //const itemDeps = $derived(propsList.map((key) => key?.item))

  const getReferenceProps = (userProps?: HTMLAttributes<Element>) => mergeProps(userProps, propsList, "reference")

  const getFloatingProps = (userProps?: HTMLAttributes<HTMLElement>) => mergeProps(userProps, propsList, "floating")

  const getItemProps = (userProps?: Omit<HTMLAttributes<HTMLElement>, "selected" | "active"> & ExtendedUserProps) =>
    mergeProps(userProps, propsList, "item")

  return { getReferenceProps, getFloatingProps, getItemProps }
}
