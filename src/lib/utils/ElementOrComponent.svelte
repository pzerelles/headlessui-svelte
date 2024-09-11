<script lang="ts" generics="TFeature extends RenderFeatures, TTag extends ElementType, TSlot, TValue">
  import type { ElementType, Props } from "./types.js"
  import { mergePropsAdvanced, RenderFeatures, type PropsForFeatures } from "./render.js"
  import Generic from "./Generic.svelte"

  let {
    ourProps,
    theirProps,
    slots,
    slot = slots,
    defaultTag,
    features,
    visible = true,
    name,
    ref = $bindable(),
    value = $bindable(),
    checked = $bindable(),
  }: {
    ourProps?: Expand<Props<any, TSlot> & PropsForFeatures<TFeature>>
    theirProps: Expand<{ as?: TTag } & Props<any, TSlot, any>>
    slot?: TSlot
    slots?: TSlot
    defaultTag: ElementType
    features?: TFeature
    visible?: boolean
    name: string
    ref?: HTMLElement
    value?: TValue
    checked?: boolean
  } = $props()

  const featureFlags = $derived(features ?? RenderFeatures.None)
  const { static: isStatic = false, unmount = true, ...rest } = $derived(mergePropsAdvanced(theirProps, ourProps ?? {}))
  const render = $derived(
    visible ||
      (featureFlags & RenderFeatures.Static && isStatic) ||
      (featureFlags & RenderFeatures.RenderStrategy && !unmount)
  )
  const hiddenProps = $derived(
    !visible && !(featureFlags & RenderFeatures.Static) && featureFlags & RenderFeatures.RenderStrategy && !unmount
      ? { hidden: true, style: "display: none;" }
      : {}
  )
</script>

{#if render}<Generic {...rest} {...hiddenProps} {slot} tag={defaultTag} {name} bind:ref bind:value bind:checked />{/if}
