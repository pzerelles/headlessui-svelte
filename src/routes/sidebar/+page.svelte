<script lang="ts">
  import MobileSidebar from "./MobileSidebar.svelte"

  let open = $state(false)
</script>

<MobileSidebar {open} close={() => (open = false)}>
  <div class="p-5">Test</div>
</MobileSidebar>

<button class="m-8 rounded-md bg-zinc-200 p-2" onclick={() => (open = true)}>Open</button>
