export function useControllable<T>(
  input: { controlledValue: T | undefined },
  onchange?: (value: T) => void,
  defaultValue?: T
) {
  let internalValue = $state(defaultValue)

  const isControlled = $derived(input.controlledValue !== undefined)
  let wasControlled = isControlled
  let didWarnOnUncontrolledToControlled = false
  let didWarnOnControlledToUncontrolled = false

  $effect(() => {
    if (isControlled && !wasControlled && !didWarnOnUncontrolledToControlled) {
      didWarnOnUncontrolledToControlled = true
      wasControlled = isControlled
      console.error(
        "A component is changing from uncontrolled to controlled. This may be caused by the value changing from undefined to a defined value, which should not happen."
      )
    } else if (!isControlled && wasControlled && !didWarnOnControlledToUncontrolled) {
      didWarnOnControlledToUncontrolled = true
      wasControlled = isControlled
      console.error(
        "A component is changing from controlled to uncontrolled. This may be caused by the value changing from a defined value to undefined, which should not happen."
      )
    }
  })

  const value = $derived(isControlled ? input.controlledValue : internalValue)!

  return {
    get value() {
      return value
    },
    onchange: (value: T) => {
      if (isControlled && onchange) {
        onchange?.(value)
      } else {
        internalValue = value
        input.controlledValue = value
      }
    },
  }
}
