<script lang="ts" module>
  export type FormFieldsContext = {
    target: HTMLElement | undefined
  }
</script>

<script lang="ts">
  import { setContext, type Snippet } from "svelte"
  import Hidden, { HiddenFeatures } from "./Hidden.svelte"

  const { children }: { children: Snippet } = $props()

  let target = $state<HTMLElement>()
  const context: FormFieldsContext = {
    get target() {
      return target
    },
  }
  setContext("FormFieldsContext", context)
</script>

{@render children()}
<Hidden features={HiddenFeatures.Hidden} bind:element={target} />
