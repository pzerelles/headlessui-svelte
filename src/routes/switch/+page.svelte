<script lang="ts">
  import Description from "$lib/description/Description.svelte"
  import Field from "$lib/field/Field.svelte"
  import Label from "$lib/label/Label.svelte"
  import Switch from "$lib/switch/Switch.svelte"

  let enabled = $state(false)
  let enabled2 = $state(false)
</script>

<div class="flex h-screen w-full justify-center px-4 pt-24">
  <div class="mx-auto h-screen w-52 pt-20">
    <Field>
      <Label>Enable notifications</Label>
      <Description>Get notified about important changes in your projects.</Description>
      <Switch
        checked={enabled}
        onchange={(checked) => (enabled = checked)}
        class="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-blue-600"
      >
        <span class="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6"></span>
      </Switch>
      <Switch
        bind:checked={enabled2}
        class="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-blue-600 data-[disabled]:bg-red-200"
        disabled={enabled}
      >
        <span class="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6"></span>
      </Switch>
    </Field>
  </div>
</div>
