const CHECKOUT_DOMAIN = 'lemonsqueezy.com'

/** True only for https URLs on lemonsqueezy.com or one of its subdomains. */
export function isSafeCheckoutUrl(value: string): boolean {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return false
    const host = url.hostname.toLowerCase()
    return host === CHECKOUT_DOMAIN || host.endsWith(`.${CHECKOUT_DOMAIN}`)
  } catch {
    return false
  }
}
