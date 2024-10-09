<script lang="ts" module>
  import Button, { type ButtonProps } from "../button/Button.svelte"
  import { useClose } from "../internal/close-provider.js"
  import type { ElementType } from "../utils/types.js"
  import type { Component } from "svelte"

  export type CloseButtonProps<TTag extends ElementType = undefined> = ButtonProps<TTag>
</script>

<script lang="ts" generics="TTag extends ElementType = undefined">
  const closeContext = useClose()
  const close = $derived(closeContext?.close)
  let { element = $bindable(), ...props }: ButtonProps<TTag> = $props()

  const ButtonComponent = Button as Component<typeof props, any>
</script>

<ButtonComponent {...props} onclick={close} bind:element />
