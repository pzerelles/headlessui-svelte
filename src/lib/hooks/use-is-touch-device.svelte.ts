export function useIsTouchDevice() {
  const mq =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(pointer: coarse)")
      : null

  let isTouchDevice = $state(mq?.matches ?? false)

  $effect(() => {
    if (!mq) return

    function handle(event: MediaQueryListEvent) {
      isTouchDevice = event.matches
    }

    mq.addEventListener("change", handle)
    return () => mq!.removeEventListener("change", handle)
  })

  return {
    get value() {
      return isTouchDevice
    },
  }
}
