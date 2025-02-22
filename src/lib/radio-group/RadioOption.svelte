<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_OPTION_TAG = "div" as const

  export type RadioOptionRenderPropArg = {
    checked: boolean
    /** @deprecated use `focus` instead */
    active: boolean
    hover: boolean
    focus: boolean
    autofocus: boolean
    disabled: boolean
  }

  export type RadioOptionOwnProps<TType> = {
    element?: HTMLElement
    value: TType
    disabled?: boolean
    autofocus?: boolean
  }

  export type RadioOptionProps<TType> = Props<
    typeof DEFAULT_OPTION_TAG,
    RadioOptionRenderPropArg,
    RadioOptionOwnProps<TType>
  >
</script>

<script lang="ts" generics="TType = ComponentProps<typeof RadioGroup>['value']">
  import { default as RadioGroup } from "./RadioGroup.svelte"
  import { useActions, useData } from "./contest.svelte.js"
  import { useId } from "$lib/hooks/use-id.js"
  import { useLabels } from "$lib/label/context.svelte.js"
  import { useDescriptions } from "$lib/description/context.svelte.js"
  import { onMount, type ComponentProps } from "svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { useFocusRing } from "$lib/hooks/use-focus-ring.svelte.js"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"

  const data = useData("RadioOption")
  const actions = useActions<TType>("RadioOption")

  const internalId = useId()
  let {
    element = $bindable(),
    id: theirId,
    value,
    disabled: theirDisabled = false,
    autofocus = false,
    ...theirProps
  }: RadioOptionProps<TType> = $props()
  const id = $derived(theirId || `headlessui-radiogroup-option-${internalId}`)
  const disabled = $derived(data.disabled || theirDisabled)

  const labelledby = useLabels()
  const describedby = useDescriptions()

  const propsRef = {
    get value() {
      return value
    },
    get disabled() {
      return disabled
    },
  }

  onMount(() => {
    return actions.registerOption({
      id,
      get element() {
        return element
      },
      get propsRef() {
        return propsRef
      },
    })
  })

  const handleClick = (event: MouseEvent) => {
    //if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    if (!actions.change(value)) return
    element?.focus()
  }

  const isFirstOption = $derived(data.firstOption?.id === id)

  const { isFocusVisible: focus, focusProps } = $derived(
    useFocusRing({
      get autofocus() {
        return autofocus
      },
    })
  )
  const { isHovered: hover, hoverProps } = $derived(
    useHover({
      get disabled() {
        return disabled
      },
    })
  )

  const checked = $derived(data.compare(data.value as TType, value))
  const ourProps = $derived(
    mergeProps(
      {
        id,
        role: "radio",
        "aria-checked": checked ? "true" : "false",
        "aria-labelledby": labelledby.value,
        "aria-describedby": describedby.value,
        "aria-disabled": disabled ? true : undefined,
        tabIndex: (() => {
          if (disabled) return -1
          if (checked) return 0
          if (!data.containsCheckedOption && isFirstOption) return 0
          return -1
        })(),
        onclick: disabled ? undefined : handleClick,
        autofocus,
      },
      focusProps,
      hoverProps
    )
  )

  const slot = $derived({
    checked,
    disabled,
    active: focus,
    hover,
    focus,
    autofocus,
  } satisfies RadioOptionRenderPropArg)
</script>

<ElementOrComponent
  {ourProps}
  {theirProps}
  slots={slot}
  defaultTag={DEFAULT_OPTION_TAG}
  bind:element
  name="RadioOption"
/>
