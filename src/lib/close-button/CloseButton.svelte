<script lang="ts" context="module">
  import type { SvelteHTMLElements } from "svelte/elements"
  import Button, { type ButtonProps } from "$lib/button/Button.svelte"
  import { getCloseContext } from "$lib/utils/close.js"

  export type CloseButtonProps<TTag extends keyof SvelteHTMLElements = typeof DEFAULT_BUTTON_TAG> = ButtonProps<TTag>

  const DEFAULT_BUTTON_TAG = "button" as const
</script>

<script lang="ts" generics="TTag extends keyof SvelteHTMLElements, TType">
  const close = getCloseContext()
  let { ...props }: CloseButtonProps<TTag> = $props()
</script>

<Button onclick={close} {...props} />
