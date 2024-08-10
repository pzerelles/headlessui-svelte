export type SlotStateProps<TSlot extends Record<string, any>> = {
  [Property in keyof TSlot as TSlot[Property] extends boolean ? `data-${string & Property}` : never]?: string
}

export type StateProps<TSlot extends Record<string, any>> = SlotStateProps<TSlot> & { "data-headlessui-state"?: string }

export const stateFromSlot = <TSlot extends Record<string, any>>(slot: TSlot = {} as TSlot): StateProps<TSlot> => {
  let dataAttributes: Record<string, string> = {}
  let exposeState = false
  let states: string[] = []
  for (let [k, v] of Object.entries(slot)) {
    if (typeof v === "boolean") {
      exposeState = true
    }

    if (v === true) {
      states.push(k.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`))
    }
  }

  if (!exposeState) return {}

  for (let s of states) {
    dataAttributes[`data-${s}`] = ""
  }
  return {
    "data-headlessui-state": states.join(" "),
    ...dataAttributes,
  } satisfies StateProps<TSlot>
}
