<script lang="ts" generics="TTag extends ElementType">
  import { MenuButton, type MenuButtonProps, type ElementType } from "$lib/index.js"
  import Button from "$lib/button/Button.svelte"

  let { as = Button as unknown as TTag, ...props }: { as?: TTag } & MenuButtonProps<TTag> = $props()
</script>

<MenuButton {as} {...props} />
