let serverHandoffComplete = false
let count = 0
const genId = () =>
  // Ensure the id is unique with multiple independent versions of Floating UI
  // on <React 18
  `floating-ui-${Math.random().toString(36).slice(2, 6)}${count++}`

function useFloatingId() {
  /*let id = $state(serverHandoffComplete ? genId() : undefined)

  $effect(() => {
    if (id == null) {
      id = genId()
    }
  })

  $effect(() => {
    serverHandoffComplete = true
  })*/

  return genId()
}

//const useReactId = SafeReact.useId as () => string

/**
 * Uses React 18's built-in `useId()` when available, or falls back to a
 * slightly less performant (requiring a double render) implementation for
 * earlier React versions.
 * @see https://floating-ui.com/docs/react-utils#useid
 */
export const useId = /*useReactId ||*/ useFloatingId
