<script lang="ts" module>
  import { useByComparator, type ByComparator } from "$lib/hooks/use-by-comparator.js"
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_RADIO_GROUP_TAG = "div" as const

  export type RadioGroupRenderPropArg<TType> = {
    value: TType
  }

  export type RadioGroupOwnProps<TType = string> = {
    element?: HTMLElement
    value?: TType
    defaultValue?: TType
    onchange?(value: TType): void
    by?: ByComparator<TType>
    disabled?: boolean
    form?: string
    name?: string
  }

  export type RadioGroupProps<TType = string> = Props<
    typeof DEFAULT_RADIO_GROUP_TAG,
    RadioGroupRenderPropArg<TType>,
    RadioGroupOwnProps<TType>
  >
</script>

<script lang="ts" generics="TType = string">
  import { createState, type RadioGroupActionsContext, type RadioGroupDataContext } from "./contest.svelte.js"
  import { useId } from "$lib/hooks/use-id.js"
  import { useDisabled } from "$lib/hooks/use-disabled.js"
  import { useLabelledBy } from "$lib/label/context.svelte.js"
  import { useDescribedBy } from "$lib/description/context.svelte.js"
  import { useControllable } from "$lib/hooks/use-controllable.svelte.js"
  import { getOwnerDocument } from "$lib/utils/owner.js"
  import { attemptSubmit } from "$lib/utils/form.js"
  import { Focus, focusIn, FocusResult } from "$lib/utils/focus-management.js"
  import { setContext } from "svelte"
  import FormFields from "$lib/internal/FormFields.svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const internalId = useId()
  const providedDisabled = useDisabled()
  let {
    element = $bindable(),
    id = `headlessui-radiogroup-${internalId}`,
    value: controlledValue,
    form,
    name,
    onchange: controlledOnChange,
    by,
    disabled: theirDisabled = false,
    defaultValue,
    ...theirProps
  }: RadioGroupProps<TType> = $props()

  const compare = useByComparator(by)
  let _state = createState<TType>()
  const options = $derived(_state.options)

  const disabled = $derived(providedDisabled.current || theirDisabled)
  const labelledBy = useLabelledBy()
  const describedBy = useDescribedBy()

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
  const { value, onchange } = $derived(controllable)

  const firstOption = $derived(
    options.find((option) => {
      if (option.propsRef.disabled) return false
      return true
    })
  )
  const containsCheckedOption = $derived(options.some((option) => compare(option.propsRef.value as TType, value)))

  const triggerChange = (nextValue: TType) => {
    if (disabled) return false
    if (compare(nextValue, value)) return false
    let nextOption = options.find((option) => compare(option.propsRef.value as TType, nextValue))?.propsRef
    if (nextOption?.disabled) return false

    onchange?.(nextValue)

    return true
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    let container = element
    if (!container) return

    let ownerDocument = getOwnerDocument(container)

    let all = options
      .filter((option) => option.propsRef.disabled === false)
      .map((radio) => radio.element) as HTMLElement[]

    switch (event.key) {
      case "Enter":
        attemptSubmit(event.currentTarget as HTMLElement)
        break
      case "ArrowLeft":
      case "ArrowUp":
        {
          event.preventDefault()
          event.stopPropagation()

          let result = focusIn(all, Focus.Previous | Focus.WrapAround)

          if (result === FocusResult.Success) {
            let activeOption = options.find((option) => option.element === ownerDocument?.activeElement)
            if (activeOption) triggerChange(activeOption.propsRef.value)
          }
        }
        break

      case "ArrowRight":
      case "ArrowDown":
        {
          event.preventDefault()
          event.stopPropagation()

          let result = focusIn(all, Focus.Next | Focus.WrapAround)

          if (result === FocusResult.Success) {
            let activeOption = options.find((option) => option.element === ownerDocument?.activeElement)
            if (activeOption) triggerChange(activeOption.propsRef.value)
          }
        }
        break

      case " ":
        {
          event.preventDefault()
          event.stopPropagation()

          let activeOption = options.find((option) => option.element === ownerDocument?.activeElement)
          if (activeOption) triggerChange(activeOption.propsRef.value)
        }
        break
    }
  }

  const dataContext: RadioGroupDataContext = {
    get value() {
      return value
    },
    get firstOption() {
      return firstOption
    },
    get containsCheckedOption() {
      return containsCheckedOption
    },
    get disabled() {
      return disabled
    },
    get compare() {
      return compare
    },
    get options() {
      return options
    },
  }
  setContext("RadioGroupDataContext", dataContext)

  const actionContext: RadioGroupActionsContext<TType> = {
    registerOption(option) {
      _state.registerOption(option)
      return () => {
        _state.unregisterOption(option.id)
      }
    },
    change: triggerChange,
  }
  setContext("RadioGroupActionsContext", actionContext)

  const ourProps = $derived({
    id,
    role: "radiogroup",
    "aria-labelledby": labelledBy.value,
    "aria-describedby": describedBy.value,
    onkeydown: handleKeyDown,
  })

  const slot = $derived({
    value,
  } satisfies RadioGroupRenderPropArg<TType>)

  const reset = () => {
    if (defaultValue === undefined) return
    return triggerChange(defaultValue)
  }
</script>

{#if name}
  <FormFields
    {disabled}
    data={{ [name]: value || "on" }}
    overrides={{ type: "radio", checked: value != null && value !== undefined }}
    {form}
    onReset={reset}
  />
{/if}
<ElementOrComponent
  {ourProps}
  {theirProps}
  slots={slot}
  defaultTag={DEFAULT_RADIO_GROUP_TAG}
  bind:element
  name="RadioGroup"
/>
