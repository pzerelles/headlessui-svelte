<script lang="ts" generics="TFeature extends RenderFeatures, TTag extends ElementType, TSlot, TValue">
  import type { ElementType, Props } from "./types.js"
  import { compact, mergePropsAdvanced, RenderFeatures, type PropsForFeatures } from "./render.js"
  import { stateFromSlot } from "./state.js"

  let {
    ourProps,
    theirProps,
    slots,
    slot = slots,
    defaultTag,
    features,
    visible = true,
    name,
    element = $bindable(),
    value = $bindable(),
    checked = $bindable(),
  }: {
    ourProps?: Expand<Props<any, TSlot> & PropsForFeatures<TFeature>>
    theirProps: Expand<Props<any, TSlot, any>>
    slot?: TSlot
    slots?: TSlot
    defaultTag: ElementType
    features?: TFeature
    visible?: boolean
    name: string
    ref?: HTMLElement
    element?: HTMLElement
    value?: TValue
    checked?: boolean
  } = $props()

  const featureFlags = $derived(features ?? RenderFeatures.None)
  let {
    as,
    static: isStatic = false,
    unmount = true,
    children,
    ...rest
  } = $derived(mergePropsAdvanced(theirProps, ourProps ?? {}))
  const render = $derived(
    visible ||
      (featureFlags & RenderFeatures.Static && isStatic) ||
      (featureFlags & RenderFeatures.RenderStrategy && !unmount)
  )

  const _props = $derived.by(() => {
    // Allow for className to be a function with the slot as the contents
    if ("className" in rest && rest.className && typeof rest.className === "function") {
      rest.className = rest.className(slot)
    }

    // Drop `aria-labelledby` if it only references the current element. If the `aria-labelledby`
    // references itself but also another element then we can keep it.
    if (rest["aria-labelledby"] && rest["aria-labelledby"] === rest.id) {
      rest["aria-labelledby"] = undefined
    }

    const hiddenProps =
      !visible && !(featureFlags & RenderFeatures.Static) && featureFlags & RenderFeatures.RenderStrategy && !unmount
        ? { hidden: true, style: "display: none;" }
        : {}

    return { ...rest, ...hiddenProps, ...stateFromSlot(slot) }
  })

  const As = $derived(as ?? defaultTag)
</script>

{#if render}
  {#if As === "svelte:fragment"}
    {@render children?.({ ...slot, props: _props })}
  {:else if typeof As === "function"}
    <As {..._props} bind:element bind:checked bind:value>{@render children?.(slot)}</As>
  {:else if As === "select"}
    <select {..._props} bind:this={element} bind:value>{@render children(slot)}</select>
  {:else if As === "input" && _props.type === "checkbox"}
    <input type="checkbox" {..._props} bind:this={element} bind:checked />
  {:else if As === "input"}
    <input {..._props} bind:this={element} bind:value />
  {:else if As === "textarea"}
    <textarea {..._props} bind:this={element} bind:value></textarea>
  {:else if children}
    <svelte:element this={As} {..._props} bind:this={element}>{@render children(slot)}</svelte:element>
  {:else}
    <svelte:element this={As} {..._props} bind:this={element} />
  {/if}
{/if}
