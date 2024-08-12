<script lang="ts" generics="TTag extends ElementType | SvelteComponent | Component<any, any>, TSlot">
  import type { Component, Snippet, SvelteComponent } from "svelte"
  import type { ElementType, HTMLElementType } from "./types.js"

  let {
    as,
    ref = $bindable(),
    slot,
    class: className,
    children,
    ...props
  }: {
    as: TTag
    ref?:
      | (TTag extends "svelte:fragment" ? HTMLElement : TTag extends ElementType ? HTMLElementType<TTag> : HTMLElement)
      | null
    slot: TSlot
    class?: string | null | ((bag: TSlot) => string)
    children: Snippet<[TSlot]> | undefined
  } = $props()

  const isComponent = (
    as: ElementType | SvelteComponent<any> | Component<any, any>
  ): as is SvelteComponent<any> | Component<any, any> => typeof as !== "string"

  const resolvedClass = $derived(typeof className === "function" ? className(slot) : className)
</script>

{#if isComponent(as)}
  <svelte:component this={as} bind:ref {...props} class={resolvedClass}>
    {#if children}{@render children(slot)}{/if}
  </svelte:component>
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
