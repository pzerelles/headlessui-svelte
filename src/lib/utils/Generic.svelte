<script lang="ts" generics="TTag extends keyof SvelteHTMLProps, TSlot, TValue">
  import { stateFromSlot } from "./state.js"
  import type { ElementType, Props, SvelteHTMLProps } from "./types.js"

  let {
    slot = {} as TSlot,
    tag,
    ref = $bindable(),
    value = $bindable(),
    checked = $bindable(),
    children,
    as = tag as TTag,
    unmount,
    static: isStatic,
    ...props
  }: {
    as?: TTag
    slot: TSlot
    tag: ElementType
    ref?: HTMLElement
    value?: TValue
    checked?: boolean
  } & Props<TTag, TSlot> = $props()

  const resolvedClass = $derived(
    typeof props.class === "function" ? props.class(slot) : (props.class as string | undefined)
  )
</script>

{#if as === "svelte:fragment"}
  {#if children}{@render children({
      slot,
      props: {
        ...props,
        ...(resolvedClass ? { class: resolvedClass } : {}),
        ...stateFromSlot(slot),
      },
    })}{/if}
{:else if children}
  {#if as === "select"}
    <select bind:this={ref} {...props} class={resolvedClass} {...stateFromSlot(slot)} bind:value>
      {@render children({ slot, props: {} })}
    </select>
  {:else}
    <svelte:element this={as} bind:this={ref} {...props} class={resolvedClass} {...stateFromSlot(slot)}>
      {@render children({ slot, props: {} })}
    </svelte:element>
  {/if}
{:else if as === "input" && props.type === "checkbox"}
  <input type="checkbox" bind:this={ref} {...props} class={resolvedClass} {...stateFromSlot(slot)} bind:checked />
{:else if as === "input"}
  <input bind:this={ref} {...props} class={resolvedClass} {...stateFromSlot(slot)} bind:value />
{:else if as === "textarea"}
  <textarea bind:this={ref} {...props} class={resolvedClass} {...stateFromSlot(slot)} bind:value></textarea>
{:else}
  <svelte:element this={as} bind:this={ref} {...props} class={resolvedClass} {...stateFromSlot(slot)} />
{/if}
