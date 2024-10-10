import { getContext } from "svelte"

export enum DialogStates {
  Open,
  Closed,
}

export interface StateDefinition {
  titleId: string | null
  panelRef: HTMLElement | null
}

export type DialogContext = StateDefinition & {
  dialogState: DialogStates
  unmount: boolean
  close(): void
  setTitleId(id: string | null): void
}

export function useDialogContext(component: string) {
  const context = getContext<DialogContext>("DialogContext")
  if (!context) {
    const err = new Error(`<${component} /> is missing a parent <Dialog /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDialogContext)
    throw err
  }
  return context
}
