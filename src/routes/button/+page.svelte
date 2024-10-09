<script lang="ts">
  import Button from "$lib/button/Button.svelte"
  import { CloseButton } from "$lib/index.js"
</script>

<CloseButton>
  {#snippet children(slot)}{/snippet}
</CloseButton>
