<script lang="ts">
  import { onMount } from "svelte"
  import Hidden, { HiddenFeatures } from "./Hidden.svelte"

  interface FocusSentinelProps {
    onfocus: () => boolean
  }

  let { onfocus }: FocusSentinelProps = $props()

  let enabled = $state(true)
  let mounted = $state(false)

  onMount(() => {
    mounted = true
  })

  const handleFocus = (event: FocusEvent) => {
    event.preventDefault()
    let frame: ReturnType<typeof requestAnimationFrame>

    let tries = 50
    function forwardFocus() {
      // Prevent infinite loops
      if (tries-- <= 0) {
        if (frame) cancelAnimationFrame(frame)
        return
      }

      // Try to move focus to the correct element. This depends on the implementation
      // of `onFocus` of course since it would be different for each place we use it in.
      if (onfocus?.()) {
        cancelAnimationFrame(frame)
        if (!mounted) return

        enabled = false
        return
      }

      // Retry
      frame = requestAnimationFrame(forwardFocus)
    }

    frame = requestAnimationFrame(forwardFocus)
  }
</script>

{#if enabled}
  <Hidden asChild features={HiddenFeatures.Focusable}>
    {#snippet children({ props })}
      <button {...props} type="button" onfocus={handleFocus}>&zwnj;</button>
    {/snippet}
  </Hidden>
{/if}
