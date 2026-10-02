const KNOWN = [
  'parse_failed',
  'empty_date_range',
  'chat_too_large',
  'timeout',
  'internal_error',
  'connection',
  'invalid_link',
] as const

export type AnalysisErrorKey = (typeof KNOWN)[number]

/** Maps a backend error code (or a client-side code) to a key of `analysis.errorCodes`. */
export function analysisErrorKey(code: string | null | undefined): AnalysisErrorKey {
  return (KNOWN as readonly string[]).includes(code ?? '') ? (code as AnalysisErrorKey) : 'internal_error'
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: string | null): value is string {
  return !!value && UUID_RE.test(value)
}
