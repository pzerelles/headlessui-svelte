<script lang="ts" context="module">
  import type { SvelteHTMLElements } from "svelte/elements"

  export type ButtonProps<TTag extends keyof SvelteHTMLElements = typeof DEFAULT_BUTTON_TAG> =
    SvelteHTMLElements[TTag] & {
      as?: TTag
      disabled?: boolean
      autofocus?: boolean
      type?: "button" | "submit" | "reset"
      children?: Snippet<
        [
          {
            disabled: boolean
            hover: boolean
            focus: boolean
            active: boolean
            autofocus: boolean
          },
        ]
      >
    }

  const DEFAULT_BUTTON_TAG = "button" as const
</script>

<script lang="ts" generics="TTag extends keyof SvelteHTMLElements, TType">
  import { tick, type Snippet } from "svelte"
  import { createHover } from "svelte-interactions"
  import { attemptSubmit } from "../utils/form.js"
  import { getIdContext, htmlid } from "../utils/id.js"
  import { createActivePress } from "../actions/activePress.svelte.js"
  import { createFocusRing } from "../actions/focusRing.svelte.js"
  import FormFields from "../internal/FormFields.svelte"
  import { getLabelContext } from "../label/Label.svelte"
  import { getDisabledContext } from "../utils/disabled.js"
  import { stateFromSlot } from "../utils/state.js"

  const providedDisabled = getDisabledContext()

  let {
    as,
    disabled: ownDisabled = false,
    autofocus = false,
    type = "button",
    children,
    ...theirProps
  }: ButtonProps<TTag> = $props()

  const disabled = $derived(providedDisabled?.disabled || ownDisabled)

  const { hoverAction: hover, isHovered } = $derived(createHover({ isDisabled: disabled }))
  const ap = $derived(createActivePress({ disabled }))
  const fr = createFocusRing({ autofocus })

  const slot = $derived({
    disabled,
    hover: $isHovered,
    focus: fr.focusVisible,
    active: ap.pressed,
    autofocus,
  })

  const ownProps = $derived({
    type,
    disabled: disabled || undefined,
    autofocus,
    ...stateFromSlot(slot),
  })
</script>

<svelte:element
  this={as ?? DEFAULT_BUTTON_TAG}
  use:hover
  use:ap.activePressAction
  use:fr.focusRingAction
  {...ownProps}
  {...theirProps}
>
  {#if children}{@render children(slot)}{/if}
</svelte:element>
