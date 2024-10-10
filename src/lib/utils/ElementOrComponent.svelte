<script lang="ts" generics="TFeature extends RenderFeatures, TSlot extends Record<string, any>, TValue">
  import type { Props } from "./types.js"
  import { mergePropsAdvanced, RenderFeatures, type PropsForFeatures } from "./render.js"
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
    defaultTag?: string
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
    asChild,
    class: className,
    ...rest
  } = $derived(mergePropsAdvanced(theirProps, ourProps ?? {}))
  const render = $derived(
    visible ||
      (featureFlags & RenderFeatures.Static && isStatic) ||
      (featureFlags & RenderFeatures.RenderStrategy && !unmount)
  )

  const resolvedClass: string | undefined = $derived(
    typeof className === "function" ? className(slot) : (className ?? undefined)
  )

  const _props = $derived.by(() => {
    // Allow for className to be a function with the slot as the contents
    if ("class" in rest && rest.class && typeof rest.class === "function") {
      rest.class = rest.className(slot)
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

    return { ...rest, ...(resolvedClass ? { class: resolvedClass } : {}), ...hiddenProps, ...stateFromSlot(slot) }
  })
</script>

{#if render}
  {#if asChild || !defaultTag}
    {@render children?.({ ...slot, props: _props })}
  {:else if defaultTag === "select"}
    <select {..._props} bind:this={element} bind:value>{@render children?.(slot)}</select>
  {:else if defaultTag === "input" && (_props as Record<string, any>).type === "checkbox"}
    <input type="checkbox" {..._props} bind:this={element} bind:checked />
  {:else if defaultTag === "input"}
    <input {..._props} bind:this={element} bind:value />
  {:else if defaultTag === "textarea"}
    <textarea {..._props} bind:this={element} bind:value></textarea>
  {:else if children}
    <svelte:element this={defaultTag} {..._props} bind:this={element}>{@render children(slot)}</svelte:element>
  {:else}
    <svelte:element this={defaultTag} {..._props} bind:this={element} />
  {/if}
{/if}
