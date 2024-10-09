<script lang="ts" module>
  import type { ElementType, Props } from "../utils/types.js"
  import { sortByDomNode } from "../utils/focus-management.js"
  import FocusSentinel from "../internal/FocusSentinel.svelte"
  import type { SvelteHTMLElements } from "svelte/elements"

  const DEFAULT_TABS_TAG = "div" as const
  type TabsRenderPropArg = {
    selectedIndex: number
  }
  type TabsPropsWeControl = never

  export type TabGroupProps<TTag extends ElementType = undefined> = Props<
    TTag,
    SvelteHTMLElements[typeof DEFAULT_TABS_TAG],
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
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  import StableCollection from "../utils/StableCollection.svelte"
  import ElementOrComponent from "../utils/ElementOrComponent.svelte"
  import { createTabContext } from "./context.svelte.js"
  import { untrack } from "svelte"

  let {
    element = $bindable(),
    defaultIndex = 0,
    vertical = false,
    manual = false,
    onchange,
    selectedIndex = undefined,
    ...theirProps
  }: TabGroupProps<TTag> = $props()
  const _state = createTabContext({
    get vertical() {
      return vertical
    },
    get manual() {
      return manual
    },
    get selectedIndex() {
      return selectedIndex
    },
    get defaultIndex() {
      return defaultIndex
    },
    change: (index: number) => {
      if (realSelectedIndex !== index) {
        onchange?.(index)
      }

      if (!isControlled) {
        _state.selectedIndex = index
      }
    },
  })
  const isControlled = $derived(_state.info.isControlled)
  const realSelectedIndex = $derived(isControlled ? selectedIndex! : _state.selectedIndex)

  const slot = $derived({
    selectedIndex: _state.selectedIndex,
  } satisfies TabsRenderPropArg)
  const stableTabs = $derived(_state.tabs)

  $effect(() => {
    const newSelectedIndex = selectedIndex ?? defaultIndex
    untrack(() => (_state.selectedIndex = newSelectedIndex))
  })

  $effect(() => {
    if (realSelectedIndex === undefined) return
    if (_state.tabs.length <= 0) return

    // TODO: Figure out a way to detect this without the slow sort on every render. Might be fine
    //       unless you have a lot of tabs.
    let sorted = sortByDomNode(_state.tabs, (tab) => tab.current ?? null)
    let didOrderChange = sorted.some((tab, i) => _state.tabs[i] !== tab)

    if (didOrderChange) {
      _state.change(sorted.findIndex((tab) => tab === _state.tabs[realSelectedIndex]))
    }
  })
</script>

<StableCollection>
  {#if _state.tabs.length <= 0}
    <FocusSentinel
      onfocus={() => {
        for (const tab of stableTabs) {
          if (tab?.current?.tabIndex === 0) {
            tab?.current?.focus()
            return true
          }
        }

        return false
      }}
    />
  {/if}
  <ElementOrComponent {theirProps} slots={slot} defaultTag={DEFAULT_TABS_TAG} name="TabGroup" bind:element />
</StableCollection>
