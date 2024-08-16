import { getContext, setContext } from "svelte"

export enum State {
  Open = 1 << 0,
  Closed = 1 << 1,
  Closing = 1 << 2,
  Opening = 1 << 3,
}

export type OpenClosedContext = {
  readonly value: State
}

export function useOpenClosed() {
  return getContext<OpenClosedContext | undefined>("OpenClosedContext") ?? null
}

export function createOpenClosedContext(options: { readonly value: State }) {
  setContext<OpenClosedContext>("OpenClosedContext", options)
}

export function clearOpenClosedContext() {
  setContext("OpenClosedContext", undefined)
}
