<script lang="ts">
  import { Disclosure, DisclosureButton, DisclosurePanel } from "$lib/index.js"
  import { ChevronDownIcon } from "@pzerelles/heroicons-svelte/20/solid"
</script>

<div class="flex h-screen w-full flex-col bg-black px-4 pt-24">
  <div class="mx-auto w-full max-w-lg divide-y divide-white/5 rounded-xl bg-white/5">
    <Disclosure class="p-6" defaultOpen={true}>
      <DisclosureButton class="group flex w-full items-center justify-between">
        <span class="text-sm/6 font-medium text-white group-data-[hover]:text-white/80">
          What is your refund policy?
        </span>
        <ChevronDownIcon class="size-5 fill-white/60 group-data-[open]:rotate-180 group-data-[hover]:fill-white/50" />
      </DisclosureButton>
      <DisclosurePanel class="mt-2 text-sm/5 text-white/50">
        If you're unhappy with your purchase, we'll refund you in full.
      </DisclosurePanel>
    </Disclosure>
    <Disclosure class="p-6">
      <DisclosureButton class="group flex w-full items-center justify-between">
        <span class="text-sm/6 font-medium text-white group-data-[hover]:text-white/80">
          Do you offer technical support?
        </span>
        <ChevronDownIcon class="size-5 fill-white/60 group-data-[open]:rotate-180 group-data-[hover]:fill-white/50" />
      </DisclosureButton>
      <DisclosurePanel class="mt-2 text-sm/5 text-white/50">No.</DisclosurePanel>
    </Disclosure>
  </div>
</div>
