<script lang="ts">
  import Radio from "$lib/radio-group/Radio.svelte"
  import RadioGroup from "$lib/radio-group/RadioGroup.svelte"
  import { CheckCircleIcon } from "@pzerelles/heroicons-svelte/24/solid"

  const plans = [
    { name: "Startup", ram: "12GB", cpus: "6 CPUs", disk: "256GB SSD disk" },
    { name: "Business", ram: "16GB", cpus: "8 CPUs", disk: "512GB SSD disk" },
    { name: "Enterprise", ram: "32GB", cpus: "12 CPUs", disk: "1TB SSD disk" },
  ]

  let selected = $state(plans[0])
</script>

<div class="flex h-screen w-full justify-center bg-black px-4 pt-24">
  <div class="w-full px-4">
    <div class="mx-auto w-full max-w-md">
      <RadioGroup
        by="name"
        value={selected}
        onchange={(value) => (selected = value)}
        aria-label="Server size"
        class="space-y-2"
      >
        {#each plans as plan (plan.name)}
          <Radio
            value={plan}
            class="group relative flex cursor-pointer rounded-lg bg-white/5 px-5 py-4 text-white shadow-md transition focus:outline-none data-[checked]:bg-white/10 data-[focus]:outline-1 data-[focus]:outline-white"
          >
            <div class="flex w-full items-center justify-between">
              <div class="text-sm/6">
                <p class="font-semibold text-white">{plan.name}</p>
                <div class="flex gap-2 text-white/50">
                  <div>{plan.ram}</div>
                  <div aria-hidden="true">&middot;</div>
                  <div>{plan.cpus}</div>
                  <div aria-hidden="true">&middot;</div>
                  <div>{plan.disk}</div>
                </div>
              </div>
              <CheckCircleIcon class="size-6 fill-white opacity-0 transition group-data-[checked]:opacity-100" />
            </div>
          </Radio>
        {/each}
      </RadioGroup>
    </div>
  </div>
</div>
