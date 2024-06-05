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
