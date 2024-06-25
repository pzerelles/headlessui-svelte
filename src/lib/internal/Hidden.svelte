<script lang="ts" context="module">
  import type { HTMLElementType, Props } from "$lib/utils/types.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  export enum HiddenFeatures {
    // The default, no features.
    None = 1 << 0,

    // Whether the element should be focusable or not.
    Focusable = 1 << 1,

    // Whether it should be completely hidden, even to assistive technologies.
    Hidden = 1 << 2,
  }

  const DEFAULT_VISUALLY_HIDDEN_TAG = "div" as const

  type HiddenRenderPropArg = {}
  type HiddenPropsWeControl = never
  export type HiddenProps<TTag extends keyof SvelteHTMLElements = typeof DEFAULT_VISUALLY_HIDDEN_TAG> = Props<
    TTag,
    HiddenRenderPropArg,
    HiddenPropsWeControl,
    { features?: HiddenFeatures; ref?: HTMLElementType<TTag> | null }
  >
</script>

<script lang="ts" generics="TTag extends keyof SvelteHTMLElements">
  let {
    as = DEFAULT_VISUALLY_HIDDEN_TAG as TTag,
    ref = $bindable(),
    features = HiddenFeatures.None,
    ...theirProps
  }: HiddenProps<TTag> = $props()

  let ourProps = {
    "aria-hidden":
      (features & HiddenFeatures.Focusable) === HiddenFeatures.Focusable
        ? true
        : theirProps["aria-hidden" as keyof typeof theirProps] ?? undefined,
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

<svelte:element this={as} bind:this={ref} {...ourProps} {...theirProps} />
