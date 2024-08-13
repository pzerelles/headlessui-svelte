<script lang="ts" generics="TFeature extends RenderFeatures, TTag extends TagType, TSlot">
  import type { ElementType, Props, RefType, TagType } from "./types.js"
  import { mergePropsAdvanced, RenderFeatures, type PropsForFeatures } from "./render.js"
  import Generic from "./Generic.svelte"

  let {
    ourProps,
    theirProps,
    slot,
    defaultTag,
    features,
    visible = true,
    name,
    ref = $bindable(),
  }: {
    ourProps: Expand<Props<any, TSlot, any> & PropsForFeatures<TFeature>>
    theirProps: Expand<Props<any, TSlot, any>>
    slot?: TSlot
    defaultTag: ElementType
    features?: TFeature
    visible?: boolean
    name: string
    ref?: RefType<TTag>
  } = $props()

  const mergedProps = $derived(mergePropsAdvanced(theirProps, ourProps))
</script>

<Generic {...mergedProps} {slot} tag={defaultTag} {name} bind:ref />
