<script lang="ts" context="module">
  import type { ElementType, Props } from "$lib/utils/types.js"
  import { sortByDomNode } from "$lib/utils/focus-management.js"
  import { match } from "$lib/utils/match.js"
  import FocusSentinel from "$lib/internal/FocusSentinel.svelte"
  import { setContext, getContext, untrack } from "svelte"

  const DEFAULT_TABS_TAG = "div" as const
  type TabsRenderPropArg = {
    selectedIndex: number
  }
  type TabsPropsWeControl = never

  export type TabGroupProps<TTag extends ElementType = typeof DEFAULT_TABS_TAG> = Props<
    TTag,
    TabsRenderPropArg,
    TabsPropsWeControl,
    {
      defaultIndex?: number
      onchange?: (index: number) => void
      selectedIndex?: number
      vertical?: boolean
      manual?: boolean
    }
  >

  interface StateDefinition {
    info: { isControlled: boolean }
    selectedIndex: number

    tabs: MutableRefObject<HTMLElement>[]
    panels: MutableRefObject<HTMLElement>[]
  }

  type TabsDataContext = StateDefinition & {
    orientation: "horizontal" | "vertical"
    activation: "manual" | "auto"
  }

  export function useData(component: string) {
    const context = getContext<TabsDataContext>("TabsData")
    if (!context) {
      let err = new Error(`<${component} /> is missing a parent <Tab.Group /> component.`)
      if (Error.captureStackTrace) Error.captureStackTrace(err, useData)
      throw err
    }
    return context
  }

  type TabsActionsContext = {
    registerTab: (tab: MutableRefObject<HTMLElement>) => () => void
    registerPanel: (panel: MutableRefObject<HTMLElement>) => () => void
    change: (index: number) => void
  }

  export function useActions(component: string) {
    const context = getContext<TabsActionsContext>("TabsActions")
    if (!context) {
      const err = new Error(`<${component} /> is missing a parent <Tab.Group /> component.`)
      if (Error.captureStackTrace) Error.captureStackTrace(err, useActions)
      throw err
    }
    return context
  }
</script>

<script lang="ts" generics="TTag extends ElementType">
  import StableCollection from "$lib/utils/StableCollection.svelte"
  import type { MutableRefObject } from "$lib/utils/ref.js"

  enum Direction {
    Forwards,
    Backwards,
  }

  enum Ordering {
    Less = -1,
    Equal = 0,
    Greater = 1,
  }

  const stateReducer = (initialState: StateDefinition) => {
    let _state = $state(initialState)
    return {
      get info() {
        return _state.info
      },
      get selectedIndex() {
        return _state.selectedIndex
      },
      get tabs() {
        return _state.tabs
      },
      get panels() {
        return _state.panels
      },
      setSelectedIndex(index: number) {
        if (index === _state.selectedIndex) return
        let tabs = sortByDomNode(_state.tabs, (tab) => tab.current)
        let panels = sortByDomNode(_state.panels, (panel) => panel.current)

        let focusableTabs = tabs.filter((tab) => !tab?.current?.hasAttribute("disabled"))

        let nextState = { ..._state, tabs, panels }

        if (
          // Underflow
          index < 0 ||
          // Overflow
          index > tabs.length - 1
        ) {
          let direction = match(Math.sign(index - _state.selectedIndex), {
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
          if (focusableTabs.length === 0) {
            return nextState
          }

          let nextSelectedIndex = match(direction, {
            [Direction.Forwards]: () => tabs.findIndex((tab) => $state.is(tab, focusableTabs[0])),
            [Direction.Backwards]: () =>
              tabs.findIndex((tab) => $state.is(tab, focusableTabs[focusableTabs.length - 1])),
          })

          return {
            ...nextState,
            selectedIndex: nextSelectedIndex === -1 ? _state.selectedIndex : nextSelectedIndex,
          }
        }

        // Middle
        let before = tabs.slice(0, index)
        let after = tabs.slice(index)

        let next = [...after, ...before].find((tab) => focusableTabs.some((_tab) => $state.is(_tab, tab)))
        if (!next) return nextState

        let selectedIndex = tabs.findIndex((tab) => $state.is(tab, next)) ?? _state.selectedIndex
        if (selectedIndex === -1) selectedIndex = _state.selectedIndex

        _state = { ...nextState, selectedIndex }
      },
      registerTab(tab: MutableRefObject<HTMLElement>) {
        if (_state.tabs.some((_tab) => $state.is(_tab, tab))) return _state

        _state.tabs = sortByDomNode([..._state.tabs, tab], (tab) => tab.current)
        let activeTab = _state.tabs[_state.selectedIndex]

        // When the component is uncontrolled, then we want to maintain the actively
        // selected tab even if new tabs are inserted or removed before the active
        // tab.
        //
        // When the component is controlled, then we don't want to do this and
        // instead we want to select the tab based on the `selectedIndex` prop.
        if (!_state.info.isControlled) {
          const selectedIndex = _state.tabs.findIndex((tab) => $state.is(tab, activeTab))
          if (selectedIndex !== _state.selectedIndex) _state.selectedIndex = selectedIndex
        }
      },
      unregisterTab(tab: MutableRefObject<HTMLElement>) {
        _state.tabs = _state.tabs.filter((_tab) => !$state.is(_tab, tab))
      },
      registerPanel(panel: MutableRefObject<HTMLElement>) {
        if (_state.panels.some((_panel) => $state.is(_panel, panel))) return _state
        _state.panels = sortByDomNode([..._state.panels, panel], (panel) => panel.current)
      },
      unregisterPanel(panel: MutableRefObject<HTMLElement>) {
        console.log("unregisterPanel", panel)
        _state.panels = _state.panels.filter((_panel) => !$state.is(_panel, panel))
      },
    }
  }

  let {
    as,
    defaultIndex = 0,
    vertical = false,
    manual = false,
    onchange,
    selectedIndex = undefined,
    children,
    ...theirProps
  }: TabGroupProps<TTag> = $props()
  const orientation = $derived(vertical ? "vertical" : "horizontal")
  const activation = $derived(manual ? "manual" : "auto")

  const isControlled = $derived(selectedIndex !== undefined)

  const _state = stateReducer({
    info: { isControlled: selectedIndex !== undefined },
    selectedIndex: selectedIndex ?? defaultIndex,
    tabs: [],
    panels: [],
  })
  $effect(() => {
    untrack(() => _state.info).isControlled = isControlled
  })

  const slot = $derived({
    selectedIndex: _state.selectedIndex,
  } satisfies TabsRenderPropArg)
  const stableTabs = $derived(_state.tabs)

  const tabsData = {
    get orientation() {
      return orientation
    },
    get activation() {
      return activation
    },
    get info() {
      return _state.info
    },
    get selectedIndex() {
      return _state.selectedIndex
    },
    get tabs() {
      return _state.tabs
    },
    get panels() {
      return _state.panels
    },
  }

  const realSelectedIndex = $derived(isControlled ? selectedIndex! : _state.selectedIndex)

  const registerTab = (tab: MutableRefObject<HTMLElement>) => {
    _state.registerTab(tab)
    return () => _state.unregisterTab(tab)
  }

  const registerPanel = (panel: MutableRefObject<HTMLElement>) => {
    _state.registerPanel(panel)
    return () => _state.unregisterPanel(panel)
  }

  const change = (index: number) => {
    if (realSelectedIndex !== index) {
      onchange?.(index)
    }

    if (!isControlled) {
      _state.setSelectedIndex(index)
    }
  }

  setContext<TabsActionsContext>("TabsActions", { registerTab, registerPanel, change })
  setContext<TabsDataContext>("TabsData", {
    get orientation() {
      return orientation
    },
    get activation() {
      return activation
    },
    get info() {
      return _state.info
    },
    get selectedIndex() {
      return _state.selectedIndex
    },
    get tabs() {
      return _state.tabs
    },
    get panels() {
      return _state.panels
    },
  })

  $effect(() => {
    const newSelectedIndex = selectedIndex ?? defaultIndex
    untrack(() => _state.setSelectedIndex(newSelectedIndex))
  })

  $effect(() => {
    if (realSelectedIndex === undefined) return
    if (_state.tabs.length <= 0) return

    // TODO: Figure out a way to detect this without the slow sort on every render. Might be fine
    //       unless you have a lot of tabs.
    let sorted = sortByDomNode(_state.tabs, (tab) => tab.current)
    let didOrderChange = sorted.some((tab, i) => _state.tabs[i] !== tab)

    if (didOrderChange) {
      change(sorted.findIndex((tab) => $state.is(tab, _state.tabs[realSelectedIndex])))
    }
  })
</script>

<StableCollection>
  {#if tabsData.tabs.length <= 0}
    <FocusSentinel
      onfocus={() => {
        for (let tab of stableTabs) {
          if (tab?.current?.tabIndex === 0) {
            tab?.current?.focus()
            return true
          }
        }

        return false
      }}
    />
  {/if}
  <svelte:element this={as ?? DEFAULT_TABS_TAG} {...theirProps}>
    {#if children}{@render children(slot)}{/if}
  </svelte:element>
</StableCollection>
