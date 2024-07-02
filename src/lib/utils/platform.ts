/* eslint-disable @typescript-eslint/no-explicit-any */
export function testUserAgent(re: RegExp) {
  if (typeof window === "undefined" || window.navigator == null) {
    return false
  }
  return (
    (window.navigator as any)["userAgentData"]?.brands.some((brand: { brand: string; version: string }) =>
      re.test(brand.brand)
    ) || re.test(window.navigator.userAgent)
  )
}

export function testPlatform(re: RegExp) {
  return typeof window !== "undefined" && window.navigator != null
    ? re.test((window.navigator as any)["userAgentData"]?.platform || window.navigator.platform)
    : false
}

function cached(fn: () => boolean) {
  if (process.env.NODE_ENV === "test") {
    return fn
  }

  let res: boolean | null = null
  return () => {
    if (res == null) {
      res = fn()
    }
    return res
  }
}

export const isMac = cached(function () {
  return testPlatform(/^Mac/i)
})

export const isAndroid = cached(function () {
  return testUserAgent(/Android/i)
})

export function isIOS() {
  // TODO: This is not a great way to detect iOS, but it's the best I can do for now.
  // - `window.platform` is deprecated
  // - `window.userAgentData.platform` is still experimental (https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/platform)
  // - `window.userAgent` also doesn't contain the required information
  return (
    // Check if it is an iPhone
    testUserAgent(/iPhone/i) ||
    // Check if it is an iPad. iPad reports itself as "MacIntel", but we can check if it is a touch
    // screen. Let's hope that Apple doesn't release a touch screen Mac (or maybe this would then
    // work as expected 🤔).
    (isMac() && typeof window !== "undefined" && window.navigator != null && window.navigator.maxTouchPoints > 0)
  )
}

export function isMobile() {
  return isIOS() || isAndroid()
}
