<script lang="ts" context="module">
  import type { SvelteHTMLElements } from "svelte/elements"
  import Button, { type ButtonProps } from "$lib/button/Button.svelte"
  import { getCloseContext } from "$lib/utils/close.js"
  import type { ElementType } from "$lib/utils/types.js"

  let DEFAULT_BUTTON_TAG = "button" as const

  export type CloseButtonProps<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG> = ButtonProps<TTag>
</script>

<script lang="ts" generics="TTag extends keyof SvelteHTMLElements, TType">
  const close = getCloseContext()
  let { ...props }: { as?: TTag } & CloseButtonProps<TTag> = $props()
</script>

<Button onclick={close} {...props} />
