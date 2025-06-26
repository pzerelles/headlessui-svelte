<script lang="ts" module>
  import ElementOrComponent from "$lib/utils/ElementOrComponent.svelte"
  import type { Props } from "$lib/utils/types.js"
  import { HiddenFeatures } from "./HiddenFeatures.js"

  export * from "./HiddenFeatures.js"

  const DEFAULT_VISUALLY_HIDDEN_TAG = "span" as const

  export type HiddenRenderPropArg = {}
  type HiddenPropsWeControl = never
  export type HiddenProps = Props<
    "input",
    HiddenRenderPropArg,
    { as?: string; element?: HTMLElement; features?: HiddenFeatures }
  >
</script>

<script lang="ts">
  let {
    as = DEFAULT_VISUALLY_HIDDEN_TAG,
    element = $bindable(),
    features = HiddenFeatures.None,
    ...theirProps
  }: HiddenProps = $props()

  let ourProps = {
    "aria-hidden":
      (features & HiddenFeatures.Focusable) === HiddenFeatures.Focusable
        ? true
        : (theirProps["aria-hidden"] ?? undefined),
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

<ElementOrComponent {ourProps} {theirProps} defaultTag={as} name="Hidden" bind:element />
