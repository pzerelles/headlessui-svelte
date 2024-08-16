<script lang="ts" generics="TTag extends keyof SvelteHTMLProps, TSlot">
  import { stateFromSlot } from "./state.js"
  import type { ElementType, Props, SvelteHTMLProps } from "./types.js"

  let {
    slot = {} as TSlot,
    tag,
    name,
    ref = $bindable(),
    children,
    as = tag as TTag,
    unmount,
    static: isStatic,
    ...props
  }: {
    as?: TTag
    slot: TSlot
    tag: ElementType
    name: string
    ref?: HTMLElement
  } & Props<TTag, TSlot> = $props()

  const resolvedClass = $derived(
    typeof props.class === "function" ? props.class(slot) : (props.class as string | undefined)
  )
</script>

{#if as === "svelte:fragment"}
  {#if children}{@render children(slot, {
      ...props,
      ...(resolvedClass ? { class: resolvedClass } : {}),
      ...stateFromSlot(slot),
    })}{/if}
{:else}
  <svelte:element this={as} bind:this={ref} {...props} class={resolvedClass} {...stateFromSlot(slot)}>
    {#if children}{@render children(slot, {})}{/if}
  </svelte:element>
{/if}
