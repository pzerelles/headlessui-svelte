import { BROWSER } from "esm-env"

type PointerPosition = [x: number, y: number]

function eventToPosition(evt: PointerEvent): PointerPosition {
  return [evt.screenX, evt.screenY]
}

export function useTrackedPointer() {
  let lastPos: PointerPosition = [-1, -1]

  return {
    wasMoved(evt: PointerEvent) {
      // FIXME: Remove this once we use browser testing in all the relevant places.
      // NOTE: This is replaced with a compile-time define during the build process
      // This hack exists to work around a few failing tests caused by our inability to "move" the virtual pointer in JSDOM pointer events.
      if (!BROWSER && process.env.TEST_BYPASS_TRACKED_POINTER) {
        return true
      }

      let newPos = eventToPosition(evt)

      if (lastPos[0] === newPos[0] && lastPos[1] === newPos[1]) {
        return false
      }

      lastPos = newPos
      return true
    },

    update(evt: PointerEvent) {
      lastPos = eventToPosition(evt)
    },
  }
}
