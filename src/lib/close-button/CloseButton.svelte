<script lang="ts" module>
  import Button, { type ButtonProps } from "$lib/button/Button.svelte"
  import { useClose } from "$lib/internal/close-provider.js"

  export type CloseButtonProps = ButtonProps
</script>

<script lang="ts">
  const closeContext = useClose()
  const close = $derived(closeContext?.close)
  let { ...props }: CloseButtonProps = $props()
</script>

<Button onclick={close} {...props} />
