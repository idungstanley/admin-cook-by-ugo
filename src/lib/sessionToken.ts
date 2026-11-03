const STORAGE_KEY = 'cbu-session'

/**
 * Lets sign-in work when the API is on a different domain, where browsers refuse to send its
 * cookie. Session storage clears when the tab closes, and the API can revoke the token at any time.
 */
export const sessionToken = {
  get: () => {
    try {
      return sessionStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  },
  set: (token: string) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, token)
    } catch {
      // Storage can be blocked, for example in private browsing. The cookie still covers same-site use.
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Nothing stored.
    }
  },
}
