<script lang="ts">
  import Button from "$lib/button/Button.svelte"
  import Transition from "$lib/transition/Transition.svelte"
  import { ArrowPathIcon } from "@pzerelles/heroicons-svelte/16/solid"
  import clsx from "clsx"

  let isShowing = $state(true)
  let ref = $state<HTMLElement>()
</script>

<div class="flex h-screen w-full justify-center bg-black px-4 pt-24">
  <div class="mx-auto h-screen w-52 pt-20">
    <div class="fixed top-24 w-52 text-right">
      <div class="mt-8 flex flex-col items-center">
        <div class="size-[6.25rem]">
          <Transition show={isShowing} {ref}>
            {#snippet children(slot, props)}
              <div
                bind:this={ref}
                {...props}
                class={clsx(
                  "size-full rounded-xl bg-white shadow-lg transition duration-500",
                  "data-[closed]:rotate-[-120deg] data-[closed]:scale-50 data-[closed]:opacity-0",
                  "data-[leave]:duration-200 data-[leave]:ease-in-out",
                  "data-[leave]:data-[closed]:rotate-[0deg] data-[leave]:data-[closed]:scale-95"
                )}
              ></div>
            {/snippet}
          </Transition>
        </div>

        <Button
          onclick={() => {
            isShowing = false
            setTimeout(() => (isShowing = true), 500)
          }}
          class="mt-10 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm/6 font-semibold text-white transition data-[hover]:scale-105 data-[hover]:bg-white/15"
        >
          <ArrowPathIcon class="size-4 fill-white/50" />
          <span>Click to transition</span>
        </Button>
      </div>
    </div>
  </div>
</div>
