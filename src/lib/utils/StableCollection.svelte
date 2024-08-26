<script lang="ts" module>
  import { useId } from "$lib/hooks/use-id.js"
  import { getContext, setContext, type Snippet } from "svelte"

  type CollectionKey = string | symbol
  type CollectionItem = [number, () => void]
  type Collection = ReturnType<typeof createCollection>

  function createCollection() {
    return {
      /** @type {Map<string, Map<string, number>>} */
      groups: new Map(),

      get(group: string, key: CollectionKey): CollectionItem {
        let list = this.groups.get(group)
        if (!list) {
          list = new Map()
          this.groups.set(group, list)
        }

        let renders = list.get(key) ?? 0
        // FIXME: This is a side-effect during render. `release` is only called in
        // an effect cleanup so we may never release if we had to render multiple
        // times before commit e.g. when a sibling suspends.
        list.set(key, renders + 1)

        let index = Array.from(list.keys()).indexOf(key)
        function release() {
          let renders = list.get(key)
          if (renders > 1) {
            list.set(key, renders - 1)
          } else {
            list.delete(key)
          }
        }

        return [index, release]
      },
    }
  }

  export function useStableCollectionIndex(group: string) {
    let collection = getContext<Collection>("StableCollection")
    if (!collection) throw new Error("You must wrap your component in a <StableCollection>")

    let key = useId()
    let [idx, cleanupIdx] = collection.get(group, key)

    $effect(() => cleanupIdx)
    return idx
  }
</script>

<script lang="ts">
  const collection = createCollection()
  setContext<Collection>("StableCollection", collection)

  let { children }: { children: Snippet } = $props()
</script>

{#if children}{@render children()}{/if}
