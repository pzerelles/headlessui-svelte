<script lang="ts" context="module">
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import type { ElementType, Props } from "$lib/utils/types.js"
  import type { SvelteHTMLElements } from "svelte/elements"

  const DEFAULT_VISUALLY_HIDDEN_TAG = "span" as const

  export enum HiddenFeatures {
    // The default, no features.
    None = 1 << 0,

    // Whether the element should be focusable or not.
    Focusable = 1 << 1,

    // Whether it should be completely hidden, even to assistive technologies.
    Hidden = 1 << 2,
  }

  type HiddenRenderPropArg = {}
  type HiddenPropsWeControl = never
  export type HiddenProps<TTag extends ElementType = typeof DEFAULT_VISUALLY_HIDDEN_TAG> = Props<
    TTag,
    HiddenRenderPropArg,
    HiddenPropsWeControl,
    { features?: HiddenFeatures }
  >
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_VISUALLY_HIDDEN_TAG">
  let { ref = $bindable(), features = HiddenFeatures.None, ...theirProps }: { as?: TTag } & HiddenProps<TTag> = $props()

  let ourProps = {
    "aria-hidden":
      (features & HiddenFeatures.Focusable) === HiddenFeatures.Focusable
        ? true
        : (theirProps["aria-hidden" as keyof typeof theirProps] ?? undefined),
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

<ElementOrComponent {ourProps} {theirProps} defaultTag={DEFAULT_VISUALLY_HIDDEN_TAG} name="Hidden" bind:ref />
