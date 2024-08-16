<script lang="ts">
  import Description from "$lib/description/Description.svelte"
  import Dialog from "$lib/dialog/Dialog.svelte"
  import DialogPanel from "$lib/dialog/DialogPanel.svelte"
  import DialogTitle from "$lib/dialog/DialogTitle.svelte"

  let open = $state(false)
</script>

<button onclick={() => (open = true)}>Open dialog</button>
<Dialog {open} onClose={() => (open = false)} class="relative z-50">
  <div class="fixed inset-0 flex w-screen items-center justify-center p-4">
    <DialogPanel class="max-w-lg space-y-4 border bg-white p-12">
      <DialogTitle class="font-bold">Deactivate account</DialogTitle>
      <Description>This will permanently deactivate your account</Description>
      <p>Are you sure you want to deactivate your account? All of your data will be permanently removed.</p>
      <div class="flex gap-4">
        <button onclick={() => (open = false)}>Cancel</button>
        <button onclick={() => (open = false)}>Deactivate</button>
      </div>
    </DialogPanel>
  </div>
</Dialog>
