export const useFormatNumber = (options: { value: number; decimals: number }) => {
  const { value } = $derived(options)
  return {
    get value() {
      return value.toFixed(options.decimals)
    },
  }
}
