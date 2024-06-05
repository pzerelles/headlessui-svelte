export const stateFromSlot = <TSlot extends Record<string, any>>(slot: TSlot = {} as TSlot) => {
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

  if (exposeState) {
    dataAttributes["data-headlessui-state"] = states.join(" ")
    for (let s of states) {
      dataAttributes[`data-${s}`] = ""
    }
  }
  return dataAttributes
}
