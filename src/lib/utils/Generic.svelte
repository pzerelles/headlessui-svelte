<script lang="ts" generics="TTag extends TagType, TSlot">
  import type { Component, SvelteComponent } from "svelte"
  import type { ElementType, HTMLElementType, Props, TagType } from "./types.js"

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
  }: Props<TTag, TSlot> & {
    slot: TSlot
    tag: TagType
    name: string
    ref?:
      | (TTag extends "svelte:fragment" ? HTMLElement : TTag extends ElementType ? HTMLElementType<TTag> : HTMLElement)
      | null
  } = $props()

  const isComponent = (
    as: ElementType | SvelteComponent | Component<any, any>
  ): as is SvelteComponent | Component<any, any> => typeof as !== "string"

  const resolvedClass = $derived(typeof props.class === "function" ? props.class(slot) : props.class)
</script>

{#if isComponent(as)}
  {@const Component = as as Component<any, any>}
  <Component bind:ref {...props} class={resolvedClass}>
    {#if children}{@render children(slot)}{/if}
  </Component>
{:else if as === "svelte:fragment"}
  {#if children}{@render children({
      ...slot,
      props: { ...props, ...(resolvedClass ? { class: resolvedClass } : {}) },
    })}{/if}
{:else}
  <svelte:element this={as} bind:this={ref} {...props} class={resolvedClass}>
    {#if children}{@render children(slot)}{/if}
  </svelte:element>
{/if}
