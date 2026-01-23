<script>
  import Popover from "$lib/popover/Popover.svelte"
  import PopoverButton from "$lib/popover/PopoverButton.svelte"
  import PopoverGroup from "$lib/popover/PopoverGroup.svelte"
  import PopoverHoverArea from "$lib/popover/PopoverHoverArea.svelte"
  import PopoverPanel from "$lib/popover/PopoverPanel.svelte"
</script>

<div class="flex h-screen w-full flex-col items-center justify-start gap-8 bg-black px-4 pt-40">
  <PopoverGroup class="flex gap-8">
    <Popover>
      <PopoverButton
        class="block text-sm/6 font-semibold text-white/50 focus:outline-none data-[active]:text-white data-[focus]:outline-1 data-[focus]:outline-white data-[hover]:text-white"
      >
        Products
      </PopoverButton>
      <PopoverPanel
        transition
        anchor="bottom"
        class="divide-y divide-white/5 rounded-xl bg-white/5 text-sm/6 transition duration-200 ease-in-out [--anchor-gap:theme(spacing.2)] [--anchor-padding:theme(spacing.1)] data-[anchor~=end]:[--anchor-offset:6px] data-[anchor~=start]:[--anchor-offset:-6px] data-[closed]:-translate-y-1 data-[closed]:opacity-0 sm:data-[anchor~=end]:[--anchor-offset:4px] sm:data-[anchor~=start]:[--anchor-offset:-4px]"
      >
        <div class="p-3">
          <a class="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="/">
            <p class="font-semibold text-white">Insights</p>
            <p class="text-white/50">Measure actions your users take</p>
          </a>
          <a class="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="/">
            <p class="font-semibold text-white">Automations</p>
            <p class="text-white/50">Create your own targeted content</p>
          </a>
          <a class="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="/">
            <p class="font-semibold text-white">Reports</p>
            <p class="text-white/50">Keep track of your growth</p>
          </a>
        </div>
        <div class="p-3">
          <a class="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="/">
            <p class="font-semibold text-white">Documentation</p>
            <p class="text-white/50">Start integrating products and tools</p>
          </a>
        </div>
      </PopoverPanel>
    </Popover>
    <Popover>
      <PopoverButton
        class="block text-sm/6 font-semibold text-white/50 focus:outline-none data-[active]:text-white data-[focus]:outline-1 data-[focus]:outline-white data-[hover]:text-white"
      >
        Solutions
      </PopoverButton>
      <PopoverPanel
        transition
        anchor="bottom"
        class="divide-y divide-white/5 rounded-xl bg-white/5 text-sm/6 transition duration-200 ease-in-out [--anchor-gap:var(--spacing-2)] data-[closed]:-translate-y-1 data-[closed]:opacity-0"
      >
        <div class="p-3">
          <a class="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="/">
            <p class="font-semibold text-white">Insights</p>
            <p class="text-white/50">Measure actions your users take</p>
          </a>
          <a class="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="/">
            <p class="font-semibold text-white">Automations</p>
            <p class="text-white/50">Create your own targeted content</p>
          </a>
          <a class="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="/">
            <p class="font-semibold text-white">Reports</p>
            <p class="text-white/50">Keep track of your growth</p>
          </a>
        </div>
        <div class="p-3">
          <a class="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="/">
            <p class="font-semibold text-white">Documentation</p>
            <p class="text-white/50">Start integrating products and tools</p>
          </a>
        </div>
      </PopoverPanel>
    </Popover>
    <div class="text-sm/6 font-semibold text-white/50">Pricing</div>
  </PopoverGroup>

  <PopoverGroup class="flex gap-8">
    <Popover>
      <PopoverHoverArea
        class="block text-sm/6 font-semibold text-white/50 focus:outline-none data-[active]:text-white data-[focus]:outline-1 data-[focus]:outline-white data-[hover]:text-white"
      >
        Products
      </PopoverHoverArea>
      <PopoverPanel
        transition
        anchor="bottom"
        class="divide-y divide-white/5 rounded-xl bg-white/5 text-sm/6 transition duration-200 ease-in-out [--anchor-gap:theme(spacing.2)] [--anchor-padding:theme(spacing.1)] data-[anchor~=end]:[--anchor-offset:6px] data-[anchor~=start]:[--anchor-offset:-6px] data-[closed]:-translate-y-1 data-[closed]:opacity-0 sm:data-[anchor~=end]:[--anchor-offset:4px] sm:data-[anchor~=start]:[--anchor-offset:-4px]"
      >
        <div class="p-3">
          <a class="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="/">
            <p class="font-semibold text-white">Insights</p>
            <p class="text-white/50">Measure actions your users take</p>
          </a>
          <a class="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="/">
            <p class="font-semibold text-white">Automations</p>
            <p class="text-white/50">Create your own targeted content</p>
          </a>
          <a class="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="/">
            <p class="font-semibold text-white">Reports</p>
            <p class="text-white/50">Keep track of your growth</p>
          </a>
        </div>
        <div class="p-3">
          <a class="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="/">
            <p class="font-semibold text-white">Documentation</p>
            <p class="text-white/50">Start integrating products and tools</p>
          </a>
        </div>
      </PopoverPanel>
    </Popover>
    <Popover>
      <PopoverHoverArea
        class="block text-sm/6 font-semibold text-white/50 focus:outline-none data-[active]:text-white data-[focus]:outline-1 data-[focus]:outline-white data-[hover]:text-white"
        delay={1000}
      >
        Solutions
      </PopoverHoverArea>
      <PopoverPanel
        transition
        anchor="bottom"
        class="divide-y divide-white/5 rounded-xl bg-white/5 text-sm/6 transition duration-200 ease-in-out [--anchor-gap:var(--spacing-2)] data-[closed]:-translate-y-1 data-[closed]:opacity-0"
      >
        <div class="p-3">
          <a class="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="/">
            <p class="font-semibold text-white">Insights</p>
            <p class="text-white/50">Measure actions your users take</p>
          </a>
          <a class="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="/">
            <p class="font-semibold text-white">Automations</p>
            <p class="text-white/50">Create your own targeted content</p>
          </a>
          <a class="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="/">
            <p class="font-semibold text-white">Reports</p>
            <p class="text-white/50">Keep track of your growth</p>
          </a>
        </div>
        <div class="p-3">
          <a class="block rounded-lg px-3 py-2 transition hover:bg-white/5" href="/">
            <p class="font-semibold text-white">Documentation</p>
            <p class="text-white/50">Start integrating products and tools</p>
          </a>
        </div>
      </PopoverPanel>
    </Popover>
    <div class="text-sm/6 font-semibold text-white/50">Pricing</div>
  </PopoverGroup>
</div>
