<script lang="ts">
  import { onDestroy, onMount, type Snippet } from "svelte"

  let { target, children }: { target: HTMLElement; children: Snippet } = $props()
  let ref = $state<HTMLDivElement>()

  onMount(() => {
    target.appendChild(ref!)
  })

  onDestroy(() => {
    const _ref = ref
    setTimeout(() => {
      if (_ref?.parentNode) {
        _ref.parentNode?.removeChild(_ref)
      }
    })
  })
</script>

<div bind:this={ref}>{@render children()}</div>
