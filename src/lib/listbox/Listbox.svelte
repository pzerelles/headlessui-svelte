<script lang="ts" context="module">
  import { useByComparator, type ByComparator } from "$lib/hooks/use-by-comparator.js"
  import { useControllable } from "$lib/hooks/use-controllable.svelte.js"
  import { useDisabled } from "$lib/internal/disabled.js"
  import { calculateActiveIndex, Focus } from "$lib/utils/calculate-active-index.js"
  import { FocusableMode, isFocusableElement, sortByDomNode } from "$lib/utils/focus-management.js"
  import { match } from "$lib/utils/match.js"
  import { useRef, type MutableRefObject } from "$lib/utils/ref.svelte.js"
  import type { ElementType, EnsureArray, Props } from "$lib/utils/types.js"
  import { getContext, setContext } from "svelte"

  let DEFAULT_LISTBOX_TAG = "svelte:fragment"
  type ListboxRenderPropArg<T> = {
    open: boolean
    disabled: boolean
    invalid: boolean
    value: T
  }

  export type ListboxProps<
    TTag extends ElementType = typeof DEFAULT_LISTBOX_TAG,
    TType = string,
    TActualType = TType extends (infer U)[] ? U : TType,
  > = Props<
    TTag,
    ListboxRenderPropArg<TType>,
    "value" | "defaultValue" | "onchange" | "by" | "disabled" | "horizontal" | "name" | "multiple",
    {
      value?: TType
      defaultValue?: TType
      onchange?: (value: TType) => void
      by?: ByComparator<TActualType>
      disabled?: boolean
      invalid?: boolean
      horizontal?: boolean
      form?: string
      name?: string
      multiple?: boolean

      __demoMode?: boolean
    }
  >

  export enum ListboxStates {
    Open,
    Closed,
  }

  export enum ValueMode {
    Single,
    Multi,
  }

  export enum ActivationTrigger {
    Pointer,
    Other,
  }

  export type ListboxOptionDataRef<T> = MutableRefObject<{
    textValue?: string
    disabled: boolean
    value: T
    domRef: MutableRefObject<HTMLElement | null>
  }>

  interface StateDefinition<T> {
    listboxState: ListboxStates

    options: { id: string; dataRef: ListboxOptionDataRef<T> }[]
    searchQuery: string
    activeOptionIndex: number | null
    activationTrigger: ActivationTrigger

    __demoMode: boolean
  }

  type ListboxActionsContext = {
    openListbox(): void
    closeListbox(): void
    registerOption(id: string, dataRef: ListboxOptionDataRef<unknown>): () => void
    goToOption(focus: Focus.Specific, id: string, trigger?: ActivationTrigger): void
    goToOption(focus: Focus, id?: string, trigger?: ActivationTrigger): void
    selectOption(id: string): void
    selectActiveOption(): void
    onChange(value: unknown): void
    search(query: string): void
    clearSearch(): void
  }

  export function useActions(component: string) {
    const context = getContext<ListboxActionsContext>("ListboxActionsContext")
    if (!context) {
      let err = new Error(`<${component} /> is missing a parent <Listbox /> component.`)
      if (Error.captureStackTrace) Error.captureStackTrace(err, useActions)
      throw err
    }
    return context
  }

  export type ListboxDataContext = {
    value: unknown
    disabled: boolean
    invalid: boolean
    mode: ValueMode
    orientation: "horizontal" | "vertical"
    activeOptionIndex: number | null
    compare(a: unknown, z: unknown): boolean
    isSelected(value: unknown): boolean

    optionsPropsRef: MutableRefObject<{
      static: boolean
      hold: boolean
    }>

    listRef: MutableRefObject<Map<string, HTMLElement | null>>

    buttonRef: MutableRefObject<HTMLElement | null>
    optionsRef: MutableRefObject<HTMLElement | null>
  } & Omit<StateDefinition<unknown>, "dataRef">

  export function useData(component: string) {
    const context = getContext<ListboxDataContext>("ListboxData")
    if (context === null) {
      let err = new Error(`<${component} /> is missing a parent <Listbox /> component.`)
      if (Error.captureStackTrace) Error.captureStackTrace(err, useData)
      throw err
    }
    return context
  }
</script>

<script lang="ts" generics="TTag extends ElementType, TType, TActualType">
  import { outsideClick } from "$lib/actions/outsideClick.svelte.js"
  import { disposables } from "$lib/utils/disposables.js"
  import { getLabelContext } from "$lib/label/Label.svelte"
  import FormFields from "$lib/internal/FormFields.svelte"
  import { createFloatingContext } from "$lib/internal/floating.svelte.js"
  import { createOpenClosedContext, State } from "$lib/internal/open-closed.js"
  import { stateFromSlot } from "$lib/utils/state.js"

  function adjustOrderedState<T>(
    state: StateDefinition<T>,
    adjustment: (options: StateDefinition<T>["options"]) => StateDefinition<T>["options"] = (i) => i
  ) {
    let currentActiveOption = state.activeOptionIndex !== null ? state.options[state.activeOptionIndex] : null

    let sortedOptions = sortByDomNode(
      adjustment(state.options.slice()),
      (option) => option.dataRef.current.domRef.current
    )

    // If we inserted an option before the current active option then the active option index
    // would be wrong. To fix this, we will re-lookup the correct index.
    let adjustedActiveOptionIndex = currentActiveOption ? sortedOptions.indexOf(currentActiveOption) : null

    // Reset to `null` in case the currentActiveOption was removed.
    if (adjustedActiveOptionIndex === -1) {
      adjustedActiveOptionIndex = null
    }

    return {
      options: sortedOptions,
      activeOptionIndex: adjustedActiveOptionIndex,
    }
  }

  const stateReducer = (initialState: StateDefinition<TActualType>) => {
    let _state = $state(initialState)
    return {
      get listboxState() {
        return _state.listboxState
      },
      get options() {
        return _state.options
      },
      get searchQuery() {
        return _state.searchQuery
      },
      get activeOptionIndex() {
        return _state.activeOptionIndex
      },
      get activationTrigger() {
        return _state.activationTrigger
      },
      get __demoMode() {
        return _state.__demoMode
      },
      closeListbox() {
        if (disabled) return _state
        if (_state.listboxState === ListboxStates.Closed) return _state
        _state.activeOptionIndex = null
        _state.listboxState = ListboxStates.Closed
        _state.__demoMode = false
        return _state
      },
      openListbox() {
        if (disabled) return _state
        if (_state.listboxState === ListboxStates.Open) return _state

        // Check if we have a selected value that we can make active
        let activeOptionIndex = _state.activeOptionIndex
        let optionIdx = _state.options.findIndex((option) => isSelected(option.dataRef.current.value))

        if (optionIdx !== -1) {
          activeOptionIndex = optionIdx
        }
        _state.listboxState = ListboxStates.Open
        _state.activeOptionIndex = activeOptionIndex
        _state.__demoMode = false
        return _state
      },
      goToOption(
        action:
          | { focus: Focus.Specific; id: string; trigger?: ActivationTrigger }
          | { focus: Exclude<Focus, Focus.Specific>; trigger?: ActivationTrigger }
      ) {
        if (disabled) return _state
        if (_state.listboxState === ListboxStates.Closed) return _state

        _state.searchQuery = ""
        _state.activationTrigger = action.trigger ?? ActivationTrigger.Other
        _state.__demoMode = false

        // Optimization:
        //
        // There is no need to sort the DOM nodes if we know that we don't want to focus anything
        if (action.focus === Focus.Nothing) {
          _state.activeOptionIndex = null
          return _state
        }

        // Optimization:
        //
        // There is no need to sort the DOM nodes if we know exactly where to go
        if (action.focus === Focus.Specific) {
          _state.activeOptionIndex = _state.options.findIndex((o) => o.id === action.id)
          return _state
        }

        // Optimization:
        //
        // If the current DOM node and the previous DOM node are next to each other,
        // or if the previous DOM node is already the first DOM node, then we don't
        // have to sort all the DOM nodes.
        else if (action.focus === Focus.Previous) {
          let activeOptionIdx = _state.activeOptionIndex
          if (activeOptionIdx !== null) {
            let currentDom = _state.options[activeOptionIdx].dataRef.current.domRef
            let previousOptionIndex = calculateActiveIndex(action, {
              resolveItems: () => _state.options,
              resolveActiveIndex: () => _state.activeOptionIndex,
              resolveId: (option) => option.id,
              resolveDisabled: (option) => option.dataRef.current.disabled ?? false,
            })
            if (previousOptionIndex !== null) {
              let previousDom = _state.options[previousOptionIndex].dataRef.current.domRef
              if (
                // Next to each other
                currentDom.current?.previousElementSibling === previousDom?.current ||
                // Or already the first element
                previousDom.current?.previousElementSibling === null
              ) {
                _state.activeOptionIndex = previousOptionIndex
                return _state
              }
            }
          }
        }

        // Optimization:
        //
        // If the current DOM node and the next DOM node are next to each other, or
        // if the next DOM node is already the last DOM node, then we don't have to
        // sort all the DOM nodes.
        else if (action.focus === Focus.Next) {
          let activeOptionIdx = _state.activeOptionIndex
          if (activeOptionIdx !== null) {
            let currentDom = _state.options[activeOptionIdx].dataRef.current.domRef
            let nextOptionIndex = calculateActiveIndex(action, {
              resolveItems: () => _state.options,
              resolveActiveIndex: () => _state.activeOptionIndex,
              resolveId: (option) => option.id,
              resolveDisabled: (option) => option.dataRef.current.disabled ?? false,
            })
            if (nextOptionIndex !== null) {
              let nextDom = _state.options[nextOptionIndex].dataRef.current.domRef
              if (
                // Next to each other
                currentDom.current?.nextElementSibling === nextDom.current ||
                // Or already the last element
                nextDom.current?.nextElementSibling === null
              ) {
                _state.activeOptionIndex = nextOptionIndex
                return _state
              }
            }
          }
        }

        // Slow path:
        //
        // Ensure all the options are correctly sorted according to DOM position
        let adjustedState = adjustOrderedState(_state)
        let activeOptionIndex = calculateActiveIndex(action, {
          resolveItems: () => adjustedState.options,
          resolveActiveIndex: () => adjustedState.activeOptionIndex,
          resolveId: (option) => option.id,
          resolveDisabled: (option) => option.dataRef.current.disabled ?? false,
        })

        _state.options = adjustedState.options
        _state.activeOptionIndex = activeOptionIndex
        return _state
      },
      search(value: string) {
        if (disabled) return _state
        if (_state.listboxState === ListboxStates.Closed) return _state

        let wasAlreadySearching = _state.searchQuery !== ""
        let offset = wasAlreadySearching ? 0 : 1

        let searchQuery = _state.searchQuery + value.toLowerCase()

        let reOrderedOptions =
          _state.activeOptionIndex !== null
            ? _state.options
                .slice(_state.activeOptionIndex + offset)
                .concat(_state.options.slice(0, _state.activeOptionIndex + offset))
            : _state.options

        let matchingOption = reOrderedOptions.find(
          (option) => !option.dataRef.current.disabled && option.dataRef.current.textValue?.startsWith(searchQuery)
        )

        let matchIdx = matchingOption ? _state.options.indexOf(matchingOption) : -1

        if (matchIdx === -1 || matchIdx === _state.activeOptionIndex) {
          _state.searchQuery = searchQuery
        } else {
          _state.searchQuery = searchQuery
          _state.activeOptionIndex = matchIdx
          _state.activationTrigger = ActivationTrigger.Other
        }
        return _state
      },
      clearSearch() {
        if (disabled) return _state
        if (_state.listboxState === ListboxStates.Closed) return _state
        if (_state.searchQuery === "") return _state
        _state.searchQuery = ""
        return _state
      },
      registerOption(action: { id: string; dataRef: ListboxOptionDataRef<TActualType> }) {
        let option = { id: action.id, dataRef: action.dataRef }
        let adjustedState = adjustOrderedState(_state, (options) => [...options, option])

        // Check if we need to make the newly registered option active.
        if (_state.activeOptionIndex === null) {
          if (isSelected(action.dataRef.current.value as any)) {
            adjustedState.activeOptionIndex = adjustedState.options.indexOf(option)
          }
        }

        _state.options = adjustedState.options
        _state.activeOptionIndex = adjustedState.activeOptionIndex
        return _state
      },
      unregisterOption(action: { id: string }) {
        let adjustedState = adjustOrderedState(_state, (options) => {
          let idx = options.findIndex((a) => a.id === action.id)
          if (idx !== -1) options.splice(idx, 1)
          return options
        })

        _state.options = adjustedState.options
        _state.activeOptionIndex = adjustedState.activeOptionIndex
        _state.activationTrigger = ActivationTrigger.Other
        return _state
      },
    }
  }

  const listboxActionsContext: ListboxActionsContext | null = null
  setContext("ListboxActionsContext", listboxActionsContext)

  const listboxDataContext: ListboxDataContext | null = null
  setContext("ListboxDataContext", listboxDataContext)

  let {
    as,
    value: controlledValue,
    defaultValue: _defaultValue,
    form,
    name,
    onchange: controlledOnChange,
    by,
    invalid = false,
    disabled: ownDisabled = false,
    horizontal = false,
    multiple = false,
    __demoMode = false,
    children,
    ...theirProps
  }: ListboxProps<TTag, TType, TActualType> = $props()

  const providedDisabled = useDisabled()
  const disabled = $derived(providedDisabled?.disabled || ownDisabled)

  const orientation = horizontal ? "horizontal" : "vertical"
  const defaultValue = _defaultValue
  const controllable = useControllable<any>(
    {
      get controlledValue() {
        return controlledValue
      },
    },
    controlledOnChange,
    defaultValue
  )
  const { value = multiple ? [] : undefined, onchange: theirOnChange } = $derived(controllable)

  const _state = stateReducer({
    listboxState: __demoMode ? ListboxStates.Open : ListboxStates.Closed,
    options: [],
    searchQuery: "",
    activeOptionIndex: null,
    activationTrigger: ActivationTrigger.Other,
    optionsVisible: false,
    __demoMode,
  } as StateDefinition<TActualType>)

  type _Data = ListboxDataContext

  const optionsPropsRef = useRef<_Data["optionsPropsRef"]["current"]>({ static: false, hold: false })

  const buttonRef = useRef<_Data["buttonRef"]["current"]>(null)
  const optionsRef = useRef<_Data["optionsRef"]["current"]>(null)
  const listRef = useRef<_Data["listRef"]["current"]>(new Map())

  const compare = useByComparator(by)

  const isSelected = (compareValue: TActualType): boolean =>
    match(data.mode, {
      [ValueMode.Multi]: () => {
        return (value as EnsureArray<TType>).some((option) => compare(option, compareValue))
      },
      [ValueMode.Single]: () => {
        return compare(value as TActualType, compareValue)
      },
    })

  const data = {
    get listboxState() {
      return _state.listboxState
    },
    get options() {
      return _state.options
    },
    get searchQuery() {
      return _state.searchQuery
    },
    get activeOptionIndex() {
      return _state.activeOptionIndex
    },
    get activationTrigger() {
      return _state.activationTrigger
    },
    get __demoMode() {
      return _state.__demoMode
    },
    get value() {
      return value
    },
    get disabled() {
      return disabled
    },
    get invalid() {
      return invalid
    },
    get mode() {
      return multiple ? ValueMode.Multi : ValueMode.Single
    },
    get orientation() {
      return orientation
    },
    compare,
    isSelected,
    get optionsPropsRef() {
      return optionsPropsRef
    },
    get buttonRef() {
      return buttonRef
    },
    get optionsRef() {
      return optionsRef
    },
    get listRef() {
      return listRef
    },
  }
  setContext<ListboxDataContext>("ListboxDataContext", data)
  setContext("ListboxData", data)

  // Handle outside click with action
  const outsideClickEnabled = $derived(_state.listboxState === ListboxStates.Open)
  const outsideClickContainers = $derived([
    /*buttonRef, optionsRef*/
  ])
  const handleOutsideClick = (event: MouseEvent | PointerEvent | FocusEvent | TouchEvent, target: HTMLElement) => {
    _state.closeListbox()

    if (!isFocusableElement(target, FocusableMode.Loose)) {
      event.preventDefault()
      //data.buttonRef.current?.focus()
    }
  }

  const slot = $derived({
    open: _state.listboxState === ListboxStates.Open,
    disabled,
    invalid,
    value,
  } satisfies ListboxRenderPropArg<TType>)

  const selectOption = (id: string) => {
    let option = _state.options.find((item) => item.id === id)
    if (!option) return

    //onchange(option.dataRef.current.value)
  }

  const selectActiveOption = () => {
    if (_state.activeOptionIndex !== null) {
      let { dataRef, id } = _state.options[_state.activeOptionIndex]
      //onchange(dataRef.current.value)

      // It could happen that the `activeOptionIndex` stored in state is actually null,
      // but we are getting the fallback ace2437tive option back instead.424323
      _state.goToOption({ focus: Focus.Specific, id })
    }
    7
  }

  const d = disposables()
  const goToOption = (focus: Focus, id: string, trigger: ActivationTrigger) => {
    d.dispose()
    d.microTask(() => {
      if (focus === Focus.Specific) {
        return _state.goToOption({ focus: Focus.Specific, id: id!, trigger })
      }

      return _state.goToOption({ focus, trigger })
    })
  }

  const registerOption = (id: string, dataRef: ListboxOptionDataRef<TActualType>) => {
    _state.registerOption({ id, dataRef })
    return () => _state.unregisterOption({ id })
  }

  const onChange = (value: unknown) => {
    return match(data.mode, {
      [ValueMode.Single]() {
        return theirOnChange?.(value as TType)
      },
      [ValueMode.Multi]() {
        let copy = (data.value as TActualType[]).slice()

        let idx = copy.findIndex((item) => compare(item, value as TActualType))
        if (idx === -1) {
          copy.push(value as TActualType)
        } else {
          copy.splice(idx, 1)
        }

        return theirOnChange?.(copy as unknown as TType[])
      },
    })
  }

  setContext<ListboxActionsContext>("ListboxActionsContext", {
    onChange,
    registerOption,
    goToOption,
    closeListbox: _state.closeListbox,
    openListbox: _state.openListbox,
    selectActiveOption,
    selectOption,
    search: _state.search,
    clearSearch: _state.clearSearch,
  })

  createFloatingContext()

  const openClosed = $derived(
    match(data.listboxState, {
      [ListboxStates.Open]: State.Open,
      [ListboxStates.Closed]: State.Closed,
    })
  )
  createOpenClosedContext({
    get value() {
      return openClosed
    },
  })

  const labelContext = getLabelContext()
  const labelledBy = $derived(labelContext?.labelledBy)

  const ourProps = $derived(stateFromSlot(slot))

  const reset = () => {
    if (defaultValue === undefined) return
    return theirOnChange?.(defaultValue)
  }
</script>

<div
  use:outsideClick={{
    enabled: outsideClickEnabled,
    containers: outsideClickContainers,
    cb: handleOutsideClick,
  }}
></div>

{#if name && value}
  <FormFields {disabled} data={{ [name]: value }} {form} onReset={reset} />
{/if}
<svelte:element
  this={as ?? DEFAULT_LISTBOX_TAG}
  use:outsideClick={{
    enabled: outsideClickEnabled,
    containers: outsideClickContainers,
    cb: handleOutsideClick,
  }}
  {...ourProps}
  {...theirProps}
>
  {#if children}{@render children(slot)}{/if}
</svelte:element>
