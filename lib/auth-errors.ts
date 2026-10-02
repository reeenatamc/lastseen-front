/** Error codes shared by the auth routes and the UI; the UI maps them to translated texts. */
export type AuthErrorCode = 'invalid_credentials' | 'email_taken' | 'rate_limited' | 'network'

export function authErrorFromStatus(status: number): AuthErrorCode {
  if (status === 401 || status === 403) return 'invalid_credentials'
  if (status === 409) return 'email_taken'
  if (status === 429) return 'rate_limited'
  return 'network'
}

export function isAuthErrorCode(value: unknown): value is AuthErrorCode {
  return (
    value === 'invalid_credentials' ||
    value === 'email_taken' ||
    value === 'rate_limited' ||
    value === 'network'
  )
}
