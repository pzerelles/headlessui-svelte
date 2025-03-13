<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  const DEFAULT_BUTTON_TAG = "button" as const
  export type ButtonRenderPropArg = {
    open: boolean
    hover: boolean
    active: boolean
    disabled: boolean
    focus: boolean
    autofocus: boolean
  }
  type ButtonPropsWeControl = "aria-controls" | "aria-expanded"

  export type DisclosureButtonOwnProps = {
    element?: HTMLButtonElement
    disabled?: boolean
    autofocus?: boolean
  }

  export type DisclosureButtonProps = Props<typeof DEFAULT_BUTTON_TAG, ButtonRenderPropArg, DisclosureButtonOwnProps>
</script>

<script lang="ts">
  import { useId } from "$lib/hooks/use-id.js"
  import { DisclosureStates, useDisclosureContext, useDisclosurePanelContext } from "./context.svelte.js"
  import { onMount, untrack } from "svelte"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { useActivePress } from "$lib/hooks/use-active-press.svelte.js"
  import { useFocusRing } from "$lib/hooks/use-focus-ring.svelte.js"
  import { useResolveButtonType } from "$lib/hooks/use-resolve-button-type.svelte.js"
  import { mergeProps } from "$lib/utils/render.js"
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"

  const internalId = useId()
  let {
    element = $bindable(),
    id = `headlessui-disclosure-button-${internalId}`,
    disabled = false,
    autofocus = false,
    ...theirProps
  }: DisclosureButtonProps = $props()

  const context = useDisclosureContext("DisclosureButton")
  const panelContext = useDisclosurePanelContext()
  const isWithinPanel = $derived(!panelContext ? false : panelContext.panelId === context.panelId)

  onMount(() => {
    context.setButtonElement(element)
  })

  $effect(() => {
    if (isWithinPanel) return
    ;[id]
    return untrack(() => {
      context.setButtonId(id ?? undefined)
      return () => {
        context.setButtonId(undefined)
      }
    })
  })

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isWithinPanel) {
      if (context.disclosureState === DisclosureStates.Closed) return

      switch (event.key) {
        case " ":
        case "Enter":
          event.preventDefault()
          event.stopPropagation()
          context.toggleDisclosure()
          context.buttonElement?.focus()
          break
      }
    } else {
      switch (event.key) {
        case " ":
        case "Enter":
          event.preventDefault()
          event.stopPropagation()
          context.toggleDisclosure()
          break
      }
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key) {
      case " ":
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault()
        break
    }
  }

  const handleClick = (event: MouseEvent) => {
    //if (isDisabledReactIssue7711(event.currentTarget)) return
    if (disabled) return

    if (isWithinPanel) {
      context.toggleDisclosure()
      context.buttonElement?.focus()
    } else {
      context.toggleDisclosure()
    }
  }

  const { isHovered: hover, hoverProps } = $derived(
    useHover({
      get disabled() {
        return disabled
      },
    })
  )
  const { pressed: active, pressProps } = $derived(
    useActivePress({
      get disabled() {
        return disabled
      },
    })
  )
  const { isFocusVisible: focus, focusProps } = $derived(
    useFocusRing({
      get autofocus() {
        return autofocus
      },
    })
  )

  const slot = $derived({
    open: context.disclosureState === DisclosureStates.Open,
    hover,
    active,
    disabled,
    focus,
    autofocus,
  } satisfies ButtonRenderPropArg)

  const buttonType = useResolveButtonType({
    get props() {
      return { type: theirProps.type ?? undefined, as: DEFAULT_BUTTON_TAG }
    },
    get ref() {
      return { current: context.buttonElement }
    },
  })

  const ourProps = $derived(
    isWithinPanel
      ? mergeProps(
          {
            type: buttonType.type,
            disabled: disabled || undefined,
            autofocus,
            onkeydown: handleKeyDown,
            onclick: handleClick,
          },
          focusProps,
          hoverProps,
          pressProps
        )
      : mergeProps(
          {
            id,
            type: buttonType.type,
            "aria-expanded": context.disclosureState === DisclosureStates.Open,
            "aria-controls": context.panelElement ? context.panelId : undefined,
            disabled: disabled || undefined,
            autofocus,
            onkeydown: handleKeyDown,
            onkeyup: handleKeyUp,
            onclick: handleClick,
          },
          focusProps,
          hoverProps,
          pressProps
        )
  )
</script>

<ElementOrComponent
  {ourProps}
  {theirProps}
  slots={slot}
  defaultTag={DEFAULT_BUTTON_TAG}
  name="DisclosureButton"
  bind:element
/>
