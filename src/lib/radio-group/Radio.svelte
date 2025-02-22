<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_RADIO_TAG = "span" as const

  export type RadioRenderPropArg = {
    checked: boolean
    hover: boolean
    focus: boolean
    autofocus: boolean
    disabled: boolean
  }

  export type RadioOwnProps<TType> = {
    element?: HTMLElement
    value: TType
    disabled?: boolean
    autofocus?: boolean
  }

  export type RadioProps<TType = string> = Props<typeof DEFAULT_RADIO_TAG, RadioRenderPropArg, RadioOwnProps<TType>>
</script>

<script lang="ts" generics="TType = ComponentProps<typeof RadioGroup>['value']">
  import { default as RadioGroup } from "./RadioGroup.svelte"
  import { useActions, useData } from "./contest.svelte.js"
  import { useId } from "$lib/hooks/use-id.js"
  import { useLabelledBy } from "$lib/label/context.svelte.js"
  import { useDescribedBy } from "$lib/description/context.svelte.js"
  import { onMount, type ComponentProps } from "svelte"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import { useFocusRing } from "$lib/hooks/use-focus-ring.svelte.js"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import { useProvidedId } from "$lib/utils/id.js"
  import { useDisabled } from "$lib/hooks/use-disabled.js"

  const data = useData("Radio")
  const actions = useActions<TType>("Radio")

  const internalId = useId()
  const providedId = useProvidedId()
  const providedDisabled = useDisabled()
  let {
    element = $bindable(),
    id: theirId,
    value,
    disabled: theirDisabled = false,
    autofocus = false,
    ...theirProps
  }: RadioProps<TType> = $props()
  const id = $derived(theirId || providedId || `headlessui-radio-${internalId}`)
  const disabled = $derived(data.disabled || providedDisabled.current || theirDisabled)

  const labelledby = useLabelledBy()
  const describedby = useDescribedBy()

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

  const isFirstOption = $derived(data.firstOption?.id === id)

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
        autofocus,
        onclick: disabled ? undefined : handleClick,
      },
      focusProps,
      hoverProps
    )
  )

  const slot = $derived({
    checked,
    disabled,
    hover,
    focus,
    autofocus,
  } satisfies RadioRenderPropArg)
</script>

<ElementOrComponent
  {ourProps}
  {theirProps}
  slots={slot}
  defaultTag={DEFAULT_RADIO_TAG}
  bind:element
  name="RadioOption"
/>
