<script lang="ts">
  import { useFormatNumber } from "./useFormatNumber.svelte.js"

  let count = $state(0.125)

  $effect(() => console.log("raw", count))

  const formatted = useFormatNumber({
    get value() {
      return count
    },
    decimals: 2,
  })

  $effect(() => console.log("formatted", formatted.value))
</script>

<button onclick={() => (count *= 2)}>Increment</button>

<div>The value is: {formatted.value}</div>
