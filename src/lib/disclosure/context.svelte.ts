import { getContext, setContext } from "svelte"

export enum DisclosureStates {
  Open,
  Closed,
}

export interface StateDefinition {
  disclosureState: DisclosureStates

  buttonElement?: HTMLButtonElement
  panelElement?: HTMLElement

  buttonId?: string
  panelId?: string
}

export interface StateActions {
  toggleDisclosure(): void
  closeDisclosure(): void
  setButtonId(buttonId: string | undefined): void
  setPanelId(panelId: string | undefined): void
  setButtonElement(element: HTMLButtonElement | undefined): void
  setPanelElement(element: HTMLElement | undefined): void
}

export type DisclosureContext = StateDefinition & StateActions

export function createDisclosureContext(defaultOpen: boolean) {
  let disclosureState = $state(defaultOpen ? DisclosureStates.Open : DisclosureStates.Closed)
  let buttonElement = $state<HTMLButtonElement>()
  let panelElement = $state<HTMLElement>()
  let buttonId = $state<string>()
  let panelId = $state<string>()

  const context: DisclosureContext = {
    get disclosureState() {
      return disclosureState
    },
    get buttonElement() {
      return buttonElement
    },
    get panelElement() {
      return panelElement
    },
    get buttonId() {
      return buttonId
    },
    get panelId() {
      return panelId
    },
    toggleDisclosure() {
      disclosureState = disclosureState === DisclosureStates.Open ? DisclosureStates.Closed : DisclosureStates.Open
    },
    closeDisclosure() {
      if (disclosureState !== DisclosureStates.Closed) disclosureState = DisclosureStates.Closed
    },
    setButtonId(id) {
      if (id !== buttonId) buttonId = id
    },
    setPanelId(id) {
      if (id !== panelId) panelId = id
    },
    setButtonElement(element) {
      if (element !== buttonElement) buttonElement = element
    },
    setPanelElement(element) {
      if (element !== panelElement) panelElement = element
    },
  }
  setContext("DisclosureContext", context)
  return context
}

export function useDisclosureContext(component: string) {
  const context = getContext<DisclosureContext>("DisclosureContext")
  if (!context) {
    const err = new Error(`<${component} /> is missing a parent <Disclosure /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDisclosureContext)
    throw err
  }
  return context
}

export interface DisclosureAPIContext {
  close: (focusableElement?: HTMLElement) => void
}

export function createDisclosureAPIContext(close: (focusableElement?: HTMLElement) => void) {
  const context: DisclosureAPIContext = {
    close,
  }
  setContext("DisclosureAPIContext", context)
  return context
}

export function useDisclosureAPIContext(component: string) {
  const context = getContext<DisclosureAPIContext>("DisclosureAPIContext")
  if (!context) {
    const err = new Error(`<${component} /> is missing a parent <Disclosure /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDisclosureAPIContext)
    throw err
  }
  return context
}

export interface DisclosurePanelContext {
  panelId: string | undefined
}

export function createDisclosurePanelContext(panelId: () => string | undefined) {
  const context: DisclosurePanelContext = {
    get panelId() {
      return panelId()
    },
  }
  setContext("DisclosurePanelContext", context)
  return context
}

export function useDisclosurePanelContext() {
  return getContext<DisclosurePanelContext | undefined>("DisclosurePanelContext")
}
