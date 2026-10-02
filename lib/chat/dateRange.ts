export interface ChatDateRange {
  first: string
  last: string
}

// Optional invisible marks, optional "[", then D/M/Y (or M/D/Y), then a time.
const LINE_RE = /^[\u200e\u200f\ufeff\s]*\[?(\d{1,2})[/.](\d{1,2})[/.](\d{2,4}),?\s+\d{1,2}:\d{2}/

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function toIso(year: number, month: number, day: number): string | null {
  const d = new Date(Date.UTC(year, month - 1, day))
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null
  }
  return `${year}-${pad(month)}-${pad(day)}`
}

export function detectChatDateRange(text: string): ChatDateRange | null {
  const parts: [number, number, number][] = []
  let dayFirst = true
  let monthFirstSeen = false

  for (const line of text.split(/\r?\n/)) {
    const m = LINE_RE.exec(line)
    if (!m) continue
    const a = Number(m[1])
    const b = Number(m[2])
    let year = Number(m[3])
    if (m[3].length === 2) year += 2000
    if (a > 12) dayFirst = true
    else if (b > 12) monthFirstSeen = true
    parts.push([a, b, year])
  }

  if (parts.length === 0) return null
  // A first number above 12 wins; otherwise a second number above 12 means month first.
  if (monthFirstSeen && !parts.some(([a]) => a > 12)) dayFirst = false

  let first: string | null = null
  let last: string | null = null
  for (const [a, b, year] of parts) {
    const iso = dayFirst ? toIso(year, b, a) : toIso(year, a, b)
    if (!iso) continue
    if (first === null || iso < first) first = iso
    if (last === null || iso > last) last = iso
  }

  return first && last ? { first, last } : null
}

const SLICE_BYTES = 256 * 1024

/** Detects the range reading only the first and last 256 KB of the file. */
export async function detectChatDateRangeFromFile(file: File): Promise<ChatDateRange | null> {
  if (file.size <= SLICE_BYTES * 2) return detectChatDateRange(await file.text())
  const [head, tail] = await Promise.all([
    file.slice(0, SLICE_BYTES).text(),
    file.slice(file.size - SLICE_BYTES).text(),
  ])
  return detectChatDateRange(`${head}\n${tail}`)
}
