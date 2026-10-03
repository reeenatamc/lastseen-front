// Locale-aware date and number helpers shared by the report screens and the share card.

function parseDay(iso: string): Date | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

/** "2026-09-26" or a full ISO timestamp -> "26 de septiembre de 2026" (year optional). */
export function formatDay(iso: string, locale: string, withYear = true): string {
  const d = parseDay(iso)
  if (!d) return iso
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    ...(withYear ? { year: 'numeric' } : {}),
  }).format(d)
}

export function isDailyPeriod(period: string): boolean {
  return /^\d{4}-\d{2}-\d{2}/.test(period)
}

/** "2026-09-14", "2026-09" or "2026-Q3" -> readable text in the given locale. */
export function formatPeriod(period: string, locale: string): string {
  if (isDailyPeriod(period)) return formatDay(period, locale)
  const monthly = period.match(/^(\d{4})-(\d{2})$/)
  if (monthly) {
    const d = new Date(Number(monthly[1]), Number(monthly[2]) - 1, 1)
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(d)
  }
  const quarterly = period.match(/^(\d{4})-Q(\d)$/)
  if (quarterly) return `Q${quarterly[2]} ${quarterly[1]}`
  return period
}

/** Weekday names follow the backend: 0 = Monday. 2024-01-01 was a Monday. */
export function weekdayName(index: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(new Date(2024, 0, 1 + index))
}

/** Key with the highest positive count, or null. */
export function peakKey(counts: Record<string, number> | undefined): string | null {
  if (!counts) return null
  let best: string | null = null
  for (const [k, v] of Object.entries(counts)) {
    if (v > 0 && (best === null || v > counts[best])) best = k
  }
  return best
}

export type DurationUnit = 's' | 'min' | 'h' | 'd'

/** Seconds -> number plus the unit to show next to it. */
export function splitDuration(seconds: number): { value: number; unit: DurationUnit } {
  if (seconds < 60) return { value: Math.round(seconds), unit: 's' }
  if (seconds < 3600) return { value: Math.round(seconds / 60), unit: 'min' }
  if (seconds < 86400) return { value: seconds / 3600, unit: 'h' }
  return { value: seconds / 86400, unit: 'd' }
}
