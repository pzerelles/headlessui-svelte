import { useWindowEvent } from "./use-window-event.svelte.js"

export enum Direction {
  Forwards,
  Backwards,
}

export function useTabDirection() {
  let direction = $state(Direction.Forwards)
  const enabled = true

  useWindowEvent({
    enabled,
    type: "keydown",
    listener: (event) => {
      if (event.key === "Tab") {
        direction = event.shiftKey ? Direction.Backwards : Direction.Forwards
      }
    },
    options: true,
  })

  return {
    get current() {
      return direction
    },
  }
}
