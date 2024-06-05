<script lang="ts" context="module">
  export enum HiddenFeatures {
    // The default, no features.
    None = 1 << 0,

    // Whether the element should be focusable or not.
    Focusable = 1 << 1,

    // Whether it should be completely hidden, even to assistive technologies.
    Hidden = 1 << 2,
  }
</script>

<script lang="ts">
  import { onMount } from "svelte"

  import type { HTMLInputAttributes } from "svelte/elements"

  const DEFAULT_VISUALLY_HIDDEN_TAG = "div" as const

  type HiddenProps = Omit<HTMLInputAttributes, "style"> & {
    as?: string
    features?: HiddenFeatures
    ref?: (el: HTMLElement) => void
  }

  let { as = "div", features = HiddenFeatures.None, ref: applyRef, ...theirProps }: HiddenProps = $props()

  let ref = $state<HTMLElement>()

  onMount(() => {
    applyRef?.(ref!)
  })

  let ourProps = {
    "aria-hidden":
      (features & HiddenFeatures.Focusable) === HiddenFeatures.Focusable
        ? true
        : theirProps["aria-hidden"] ?? undefined,
    hidden: (features & HiddenFeatures.Hidden) === HiddenFeatures.Hidden ? true : undefined,
    style: [
      "position: fixed",
      "top: 1px",
      "left: 1px",
      "width: 1px",
      "height: 0",
      "padding: 0",
      "margin: -1px",
      "overflow: hidden",
      "clip: rect(0, 0, 0, 0)",
      "whiteSpace: nowrap",
      "borderWidth: 0",
      ...((features & HiddenFeatures.Hidden) === HiddenFeatures.Hidden &&
      !((features & HiddenFeatures.Focusable) === HiddenFeatures.Focusable)
        ? ["display: none"]
        : []),
    ].join("; "),
  }
</script>

<svelte:element this={as} {...theirProps} {...ourProps} bind:this={ref} />
