<script lang="ts" module>
  import { useByComparator, type ByComparator } from "$lib/hooks/use-by-comparator.js"
  import { useControllable } from "$lib/hooks/use-controllable.svelte.js"
  import { useDisabled } from "$lib/hooks/use-disabled.js"
  import { calculateActiveIndex, Focus } from "$lib/utils/calculate-active-index.js"
  import { FocusableMode, isFocusableElement, sortByDomNode } from "$lib/utils/focus-management.js"
  import { match } from "$lib/utils/match.js"
  import type { ElementType, EnsureArray, Props } from "$lib/utils/types.js"
  import { setContext, type Snippet } from "svelte"
  import { ActivationTrigger, ListboxStates, ValueMode } from "./context.svelte.js"

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
      closeOnSelect?: boolean

      __demoMode?: boolean
    }
  >

  export * from "./context.svelte.js"
</script>

<script lang="ts" generics="TType, TActualType, TTag extends ElementType = typeof DEFAULT_LISTBOX_TAG">
  import { disposables } from "$lib/utils/disposables.js"
  import FormFields from "$lib/internal/FormFields.svelte"
  import { useFloatingProvider } from "$lib/internal/floating.svelte.js"
  import { createOpenClosedContext, State } from "$lib/internal/open-closed.js"
  import { useLabels } from "$lib/label/context.svelte.js"
  import { useOutsideClick } from "$lib/hooks/use-outside-click.svelte.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import type {
    ListboxActionsContext,
    ListboxDataContext,
    ListboxOptionDataRef,
    StateActions,
    StateDefinition,
  } from "./context.svelte.js"
  import { SvelteMap } from "svelte/reactivity"

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
      goToOption(action) {
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
      search(value) {
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
      registerOption(id, dataRef) {
        let option = { id, dataRef }
        let adjustedState = adjustOrderedState(_state, (options) => [...options, option])

        // Check if we need to make the newly registered option active.
        if (_state.activeOptionIndex === null) {
          if (isSelected(dataRef.current.value as any)) {
            adjustedState.activeOptionIndex = adjustedState.options.indexOf(option)
          }
        }

        _state.options = adjustedState.options
        _state.activeOptionIndex = adjustedState.activeOptionIndex
        return _state
      },
      unregisterOption(id) {
        let adjustedState = adjustOrderedState(_state, (options) => {
          let idx = options.findIndex((a) => a.id === id)
          if (idx !== -1) options.splice(idx, 1)
          return options
        })

        _state.options = adjustedState.options
        _state.activeOptionIndex = adjustedState.activeOptionIndex
        _state.activationTrigger = ActivationTrigger.Other
        return _state
      },
    } satisfies StateDefinition<TActualType> & StateActions<TActualType>
  }

  let {
    ref = $bindable(),
    value: controlledValue = $bindable(),
    defaultValue,
    form,
    name,
    onchange: controlledOnChange,
    by,
    invalid = false,
    disabled: ownDisabled = false,
    horizontal = false,
    multiple = false,
    closeOnSelect,
    __demoMode = false,
    ...theirProps
  }: { as?: TTag } & ListboxProps<TTag, TType, TActualType> = $props()

  const providedDisabled = useDisabled()
  const disabled = $derived(providedDisabled.current || ownDisabled)

  const orientation = horizontal ? "horizontal" : "vertical"
  const controllable = useControllable<any>(
    {
      get controlledValue() {
        return controlledValue
      },
      set controlledValue(value) {
        controlledValue = value
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

  type _Data = ListboxDataContext<TActualType>

  const optionsProps = $state<_Data["optionsProps"]>({ static: false, hold: false })

  let buttonElement = $state<_Data["buttonElement"]>(null)
  let optionsElement = $state<_Data["optionsElement"]>(null)
  const listElements = new SvelteMap<string, HTMLElement | null>()

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

  const data: ListboxDataContext<TActualType> = {
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
    get closeOnSelect() {
      return closeOnSelect
    },
    compare,
    isSelected,
    get optionsProps() {
      return optionsProps
    },
    get buttonElement() {
      return buttonElement
    },
    set buttonElement(value) {
      buttonElement = value
    },
    get optionsElement() {
      return optionsElement
    },
    set optionsElement(value) {
      optionsElement = value
    },
    get listElements() {
      return listElements
    },
  }
  setContext<ListboxDataContext<TActualType>>("ListboxDataContext", data)

  // Handle outside click
  const outsideClickEnabled = $derived(data.listboxState === ListboxStates.Open)
  useOutsideClick({
    get enabled() {
      return outsideClickEnabled
    },
    get containers() {
      return [data.buttonElement, data.optionsElement]
    },
    cb: (event, target) => {
      _state.closeListbox()

      if (!isFocusableElement(target, FocusableMode.Loose)) {
        event.preventDefault()
        data.buttonElement?.focus()
      }
    },
  })

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
    _state.registerOption(id, dataRef)
    return () => _state.unregisterOption(id)
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

  setContext<ListboxActionsContext<TActualType>>("ListboxActionsContext", {
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

  useFloatingProvider()

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

  useLabels({
    inherit: true,
    props: {
      get htmlFor() {
        return data.buttonElement?.id
      },
    },
    slot: {
      get open() {
        return data.listboxState === ListboxStates.Open
      },
      get disabled() {
        return disabled
      },
    },
  })

  const reset = () => {
    if (defaultValue === undefined) return
    return theirOnChange?.(defaultValue)
  }
</script>

{#if name && value}
  <FormFields {disabled} data={{ [name]: value }} {form} onReset={reset} />
{/if}
<ElementOrComponent {theirProps} slots={slot} defaultTag={DEFAULT_LISTBOX_TAG} name="Listbox" bind:ref />
