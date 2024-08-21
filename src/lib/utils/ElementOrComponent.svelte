<script lang="ts" generics="TFeature extends RenderFeatures, TTag extends ElementType, TSlot">
  import type { ElementType, Props } from "./types.js"
  import { mergePropsAdvanced, RenderFeatures, RenderStrategy, type PropsForFeatures } from "./render.js"
  import Generic from "./Generic.svelte"
  import type { ComponentProps } from "svelte"

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
  } = $props()

  const featureFlags = $derived(features ?? RenderFeatures.None)
  const mergedProps = $derived(mergePropsAdvanced(theirProps, ourProps ?? {}))
</script>

{#if visible}
  <Generic
    {...mergedProps}
    {slot}
    tag={defaultTag}
    {name}
    bind:ref={ref as ComponentProps<Generic<TTag, any>>["ref"]}
  />
{:else if featureFlags & RenderFeatures.Static}
  {@const { static: isStatic = false, ...rest } = mergedProps as PropsForFeatures<RenderFeatures.Static>}
  {#if isStatic}
    <Generic {...rest} {slot} tag={defaultTag} {name} bind:ref={ref as ComponentProps<Generic<TTag, any>>["ref"]} />
  {/if}
{:else if featureFlags & RenderFeatures.RenderStrategy}
  {@const { unmount = true, ...rest } = mergedProps as PropsForFeatures<RenderFeatures.RenderStrategy>}
  {@const strategy = unmount ? RenderStrategy.Unmount : RenderStrategy.Hidden}
  {#if strategy === RenderStrategy.Hidden}
    <Generic
      {...rest}
      hidden={true}
      style="display: none;"
      {slot}
      tag={defaultTag}
      {name}
      bind:ref={ref as ComponentProps<Generic<TTag, any>>["ref"]}
    />
  {/if}
{/if}
