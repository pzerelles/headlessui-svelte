<script lang="ts" module>
  import type { Props } from "$lib/utils/types.js"

  type ButtonRenderPropArg = {
    disabled: boolean
    hover: boolean
    focus: boolean
    active: boolean
    autofocus: boolean
  }

  export type ButtonProps = Props<"button", ButtonRenderPropArg, never, { asChild?: boolean }>
</script>

<script lang="ts">
  import { useActivePress } from "../hooks/use-active-press.svelte.js"
  import { useFocusRing } from "../hooks/use-focus-ring.svelte.js"
  import { useDisabled } from "../hooks/use-disabled.js"
  import { useHover } from "$lib/hooks/use-hover.svelte.js"
  import { renderProps } from "$lib/utils/render.js"

  let {
    asChild,
    disabled: ownDisabled,
    autofocus = false,
    type = "button",
    children,
    ...theirProps
  }: ButtonProps = $props()

  const providedDisabled = useDisabled()
  const disabled = $derived(providedDisabled.current || ownDisabled || false)

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
        return autofocus ?? undefined
      },
    })
  )

  const slot = $derived({
    disabled,
    hover,
    focus,
    active,
    autofocus: autofocus ?? false,
  })

  const ourProps = $derived(
    renderProps(
      [
        theirProps,
        {
          type,
          disabled: disabled || undefined,
          autofocus,
        },
        focusProps,
        hoverProps,
        pressProps,
      ],
      { slot }
    )
  )
</script>

{#if ourProps}
  {#if asChild}
    {#if children}{@render children({ slot, props: ourProps })}{/if}
  {:else}
    <button {...ourProps}>
      {#if children}{@render children({ slot })}{/if}
    </button>
  {/if}
{/if}
