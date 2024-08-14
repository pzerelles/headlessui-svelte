<script lang="ts" context="module">
  import type { ElementType, EnsureArray, Props } from "$lib/utils/types.js"
  import type { ByComparator } from "$lib/hooks/use-by-comparator.js"

  const DEFAULT_COMBOBOX_TAG = "svelte:fragment" as const
  type ComboboxRenderPropArg<TValue, TActive = TValue> = {
    open: boolean
    disabled: boolean
    activeIndex: number | null
    activeOption: TActive | null
    value: TValue
  }

  export type CheckboxProps<
    TValue,
    TMultiple extends boolean | undefined,
    TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG,
  > = Props<
    TTag,
    ComboboxRenderPropArg<NoInfer<TValue>>,
    "value" | "defaultValue" | "multiple" | "onChange" | "by",
    {
      value?: TMultiple extends true ? EnsureArray<TValue> : TValue
      defaultValue?: TMultiple extends true ? EnsureArray<NoInfer<TValue>> : NoInfer<TValue>

      onChange?(value: TMultiple extends true ? EnsureArray<NoInfer<TValue>> : NoInfer<TValue> | null): void
      by?: ByComparator<TMultiple extends true ? EnsureArray<NoInfer<TValue>>[number] : NoInfer<TValue>>

      /** @deprecated The `<Combobox />` is now nullable default */
      nullable?: boolean

      multiple?: TMultiple
      disabled?: boolean
      form?: string
      name?: string
      immediate?: boolean
      virtual?: {
        options: NoInfer<TValue>[]
        disabled?: (value: NoInfer<TValue>) => boolean
      } | null

      onClose?(): void

      __demoMode?: boolean
    }
  >
</script>

<script lang="ts" generics="TType, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG">
  import { useDisabled } from "$lib/hooks/use-disabled.js"

  const providedDisabled = useDisabled()
</script>
