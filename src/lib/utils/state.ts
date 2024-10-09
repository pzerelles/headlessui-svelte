export type SlotStateProps<TSlot> = {
  [Property in keyof TSlot as TSlot[Property] extends boolean ? `data-${string & Property}` : never]?: string
}

export type StateProps<TSlot> = SlotStateProps<TSlot> & { "data-headlessui-state"?: string }

export const stateFromSlot = <TSlot>(slot: TSlot = {} as TSlot): StateProps<TSlot> => {
  if (typeof slot !== "object") return {}
  const dataAttributes: Record<string, string> = {}
  let exposeState = false
  const states: string[] = []
  for (const [k, v] of Object.entries(slot as Record<string, unknown>)) {
    if (typeof v === "boolean") {
      exposeState = true
    }

    if (v === true) {
      states.push(k.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`))
    }
  }

  if (!exposeState) return {}

  for (const s of states) {
    dataAttributes[`data-${s}`] = ""
  }
  return {
    "data-headlessui-state": states.join(" "),
    ...dataAttributes,
  } satisfies StateProps<TSlot>
}
