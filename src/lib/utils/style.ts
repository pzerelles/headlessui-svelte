export const camelToKebab = (s: string) => s.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)

export const stylePropsToString = (props: Record<string, unknown>) => {
  return Object.entries(props)
    .map(([key, value]) => `${camelToKebab(key)}: ${typeof value === "number" ? `${value}px` : value}`)
    .join(";")
}
