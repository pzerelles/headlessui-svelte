import { sortByDomNode } from "../utils/focus-management.js"
import { match } from "../utils/match.js"
import type { MutableRefObject } from "../utils/ref.svelte.js"
import { getContext, setContext } from "svelte"

export enum Direction {
  Forwards,
  Backwards,
}

export enum Ordering {
  Less = -1,
  Equal = 0,
  Greater = 1,
}

export type TabsContext = {
  info: { isControlled: boolean }
  selectedIndex: number
  orientation: "horizontal" | "vertical"
  activation: "manual" | "auto"
  tabs: MutableRefObject<HTMLElement | undefined>[]
  panels: MutableRefObject<HTMLElement | undefined>[]
  registerTab: (tab: MutableRefObject<HTMLElement | undefined>) => () => void
  registerPanel: (panel: MutableRefObject<HTMLElement | undefined>) => () => void
  change: (index: number) => void
}

export function useTabs(component: string) {
  const context = getContext<TabsContext>("TabsContext")
  if (!context) {
    const err = new Error(`<${component} /> is missing a parent <TabGroup /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useTabs)
    throw err
  }
  return context
}

export const createTabContext = (props: {
  vertical: boolean
  manual: boolean
  selectedIndex: number | undefined
  defaultIndex: number
  change: (index: number) => void
}) => {
  let _selectedIndex = $state($state.snapshot(props.selectedIndex ?? props.defaultIndex))
  let tabs = $state.raw<MutableRefObject<HTMLElement | undefined>[]>([])
  let panels = $state.raw<MutableRefObject<HTMLElement | undefined>[]>([])
  const isControlled = $derived(props.selectedIndex !== undefined)
  const context: TabsContext = {
    info: {
      get isControlled() {
        return isControlled
      },
    },
    get orientation() {
      return props.vertical ? "vertical" : "horizontal"
    },
    get activation() {
      return props.manual ? "manual" : "auto"
    },
    get selectedIndex() {
      return _selectedIndex
    },
    set selectedIndex(index) {
      if (index === _selectedIndex) return
      tabs = sortByDomNode(tabs, (tab) => tab.current ?? null)
      panels = sortByDomNode(panels, (panel) => panel.current ?? null)

      const focusableTabs = tabs.filter((tab) => !tab?.current?.hasAttribute("disabled"))

      if (
        // Underflow
        index < 0 ||
        // Overflow
        index > tabs.length - 1
      ) {
        const direction = match(Math.sign(index - _selectedIndex), {
          [Ordering.Less]: () => Direction.Backwards,
          [Ordering.Equal]: () => {
            return match(Math.sign(index), {
              [Ordering.Less]: () => Direction.Forwards,
              [Ordering.Equal]: () => Direction.Forwards,
              [Ordering.Greater]: () => Direction.Backwards,
            })
          },
          [Ordering.Greater]: () => Direction.Forwards,
        })

        // If there are no focusable tabs then.
        // We won't change the selected index
        // because it's likely the user is
        // lazy loading tabs and there's
        // nothing to focus on yet
        if (focusableTabs.length === 0) return

        const nextSelectedIndex = match(direction, {
          [Direction.Forwards]: () => tabs.findIndex((tab) => tab === focusableTabs[0]),
          [Direction.Backwards]: () => tabs.findIndex((tab) => tab === focusableTabs[focusableTabs.length - 1]),
        })

        if (nextSelectedIndex !== -1) _selectedIndex = nextSelectedIndex
        return
      }

      // Middle
      const before = tabs.slice(0, index)
      const after = tabs.slice(index)

      const next = [...after, ...before].find((tab) => focusableTabs.some((_tab) => _tab === tab))
      if (!next) return

      let selectedIndex = tabs.findIndex((tab) => tab === next) ?? _selectedIndex
      if (selectedIndex === -1) selectedIndex = _selectedIndex
      if (selectedIndex !== _selectedIndex) _selectedIndex = selectedIndex
    },
    get tabs() {
      return tabs
    },
    get panels() {
      return panels
    },
    registerTab(tab: MutableRefObject<HTMLElement | undefined>) {
      const unregisterTab = (tab: MutableRefObject<HTMLElement | undefined>) => {
        tabs = tabs.filter((_tab) => _tab !== tab)
      }

      if (tabs.some((_tab) => _tab === tab)) return () => unregisterTab(tab)

      tabs = sortByDomNode([...tabs, tab], (tab) => tab.current ?? null)
      const activeTab = tabs[_selectedIndex]

      // When the component is uncontrolled, then we want to maintain the actively
      // selected tab even if new tabs are inserted or removed before the active
      // tab.
      //
      // When the component is controlled, then we don't want to do this and
      // instead we want to select the tab based on the `selectedIndex` prop.
      if (isControlled) {
        const selectedIndex = tabs.findIndex((tab) => tab === activeTab)
        if (selectedIndex !== _selectedIndex) _selectedIndex = selectedIndex
      }

      return () => unregisterTab(tab)
    },
    registerPanel(panel: MutableRefObject<HTMLElement | undefined>) {
      const unregisterPanel = (panel: MutableRefObject<HTMLElement | undefined>) => {
        panels = panels.filter((_panel) => _panel !== panel)
      }

      if (!panels.some((_panel) => _panel === panel)) {
        panels = sortByDomNode([...panels, panel], (panel) => panel.current ?? null)
      }
      return () => unregisterPanel(panel)
    },
    change: props.change,
  }
  setContext("TabsContext", context)
  return context
}
