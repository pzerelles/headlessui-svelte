export function useFlags(initialFlags = 0) {
  let flags = $state(initialFlags)

  let setFlag = (flag: number) => (flags = flag)

  let addFlag = (flag: number) => (flags = flags | flag)
  let hasFlag = (flag: number) => (flags & flag) === flag
  let removeFlag = (flag: number) => (flags = flags & ~flag)
  let toggleFlag = (flag: number) => (flags = flags ^ flag)

  return {
    get flags() {
      return flags
    },
    setFlag,
    addFlag,
    hasFlag,
    removeFlag,
    toggleFlag,
  }
}
