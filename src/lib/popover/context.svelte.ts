import { getContext, setContext } from "svelte"
import type { MouseEventHandler } from "svelte/elements"

export type MouseEvent<T extends EventTarget> = Parameters<MouseEventHandler<T>>[0]

export enum PopoverStates {
  Open,
  Closed,
}

export interface StateDefinition {
  popoverState: PopoverStates

  buttons: symbol[]

  button?: HTMLElement
  buttonId?: string
  panel?: HTMLElement
  panelId?: string

  beforePanelSentinel?: HTMLButtonElement
  afterPanelSentinel?: HTMLButtonElement
  afterButtonSentinel?: HTMLButtonElement

  __demoMode: boolean
}

interface ActionDefinition {
  togglePopover(): void
  closePopover(): void
  setButton(button: HTMLElement): void
  setButtonId(buttonId: string | undefined): void
  setPanel(panel?: HTMLElement): void
  setPanelId(panelId?: string): void
}

export type PopoverContext = StateDefinition & ActionDefinition

export const createPopoverContext = (initialState: StateDefinition) => {
  const _state = $state(initialState)
  const context: PopoverContext = {
    get popoverState() {
      return _state.popoverState
    },
    get buttons() {
      return _state.buttons
    },
    get button() {
      return _state.button
    },
    get buttonId() {
      return _state.buttonId
    },
    get panel() {
      return _state.panel
    },
    get panelId() {
      return _state.panelId
    },
    get beforePanelSentinel() {
      return _state.beforePanelSentinel
    },
    set beforePanelSentinel(value) {
      _state.beforePanelSentinel = value
    },
    get afterPanelSentinel() {
      return _state.afterPanelSentinel
    },
    set afterPanelSentinel(value) {
      _state.afterPanelSentinel = value
    },
    get afterButtonSentinel() {
      return _state.afterButtonSentinel
    },
    set afterButtonSentinel(value) {
      _state.afterButtonSentinel = value
    },
    get __demoMode() {
      return _state.__demoMode
    },
    togglePopover() {
      _state.__demoMode = false
      _state.popoverState = _state.popoverState === PopoverStates.Closed ? PopoverStates.Open : PopoverStates.Closed
    },
    closePopover() {
      if (_state.popoverState === PopoverStates.Closed) return
      _state.__demoMode = false
      _state.popoverState = PopoverStates.Closed
    },
    setButton(button) {
      if (_state.button === button) return
      _state.button = button
    },
    setButtonId(buttonId) {
      if (_state.buttonId === buttonId) return
      _state.buttonId = buttonId
    },
    setPanel(panel) {
      if (_state.panel === panel) return
      _state.panel = panel
    },
    setPanelId(panelId) {
      if (_state.panelId === panelId) return
      _state.panelId = panelId
    },
  }
  setContext("PopoverContext", context)
  return context
}

export function usePopoverContext(component: string) {
  const context = getContext<PopoverContext | undefined>("PopoverContext")
  if (!context) {
    const err = new Error(`<${component} /> is missing a parent <Popover /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, usePopoverContext)
    throw err
  }
  return context
}

export type PopoverAPIContext = {
  close(focusableElement?: HTMLElement | MouseEvent<HTMLElement>): void
  isPortalled: boolean
}

export function usePopoverAPIContext(component: string) {
  const context = getContext<PopoverAPIContext | undefined>("PopoverAPIContext")
  if (!context) {
    const err = new Error(`<${component} /> is missing a parent <Popover /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, usePopoverAPIContext)
    throw err
  }
  return context
}

export type PopoverGroupContext = {
  registerPopover(registerBag: PopoverRegisterBag): void
  unregisterPopover(registerBag: PopoverRegisterBag): void
  isFocusWithinPopoverGroup(): boolean
  closeOthers(buttonId: string): void
}

export function usePopoverGroupContext() {
  return getContext<PopoverGroupContext | undefined>("PopoverGroupContext")
}

export type PopoverPanelContext = {
  value: string
}

export function usePopoverPanelContext() {
  return getContext<PopoverPanelContext | undefined>("PopoverPanelContext")
}

export interface PopoverRegisterBag {
  buttonId?: string
  panelId?: string
  close(): void
}
