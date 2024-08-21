<script lang="ts" context="module">
  import Button, { type ButtonProps } from "$lib/button/Button.svelte"
  import { useClose } from "$lib/internal/close-provider.js"
  import type { ElementType } from "$lib/utils/types.js"

  let DEFAULT_BUTTON_TAG = "button" as const

  export type CloseButtonProps<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG> = ButtonProps<TTag>
</script>

<script lang="ts" generics="TTag extends ElementType = typeof DEFAULT_BUTTON_TAG">
  const closeContext = useClose()
  const close = $derived(closeContext?.close)
  let { ...props }: { as?: TTag } & CloseButtonProps<TTag> = $props()
</script>

<Button onclick={close} {...props} />
