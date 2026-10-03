'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export const SERIF = 'var(--font-instrument-serif), "Instrument Serif", serif'

/** True on short screens (360x640 and similar), where charts shrink instead of scrolling. */
export function useShort(): boolean {
  const [short, setShort] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-height: 700px)')
    const update = () => setShort(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return short
}

/** Level 1: the figure. Gold, serif. Short values (up to 6 characters) go big; dates and names wrap smaller. */
export function Datum({ children, unit }: { children: ReactNode; unit?: string }) {
  const text = typeof children === 'string' || typeof children === 'number' ? String(children) : ''
  const short = text.length > 0 && text.length <= 6
  return (
    <p
      className={`${short ? 'story-datum-short' : 'story-datum-long'} [overflow-wrap:anywhere]`}
      style={{ fontFamily: SERIF, color: 'var(--warm)' }}
    >
      {children}
      {unit && (
        <span className="ml-[0.15em]" style={{ fontSize: '0.4em', color: 'var(--text-detail)' }}>
          {unit}
        </span>
      )}
    </p>
  )
}

/** Level 2: one sentence saying what the figure is. */
export function Phrase({ children }: { children: ReactNode }) {
  return (
    <p className="story-phrase text-[var(--text-primary)]" style={{ fontFamily: SERIF }}>
      {children}
    </p>
  )
}

/** Level 3: detail lines, legible (contrast above 4.5:1 in both themes). */
export function Detail({ lines }: { lines: Array<string | null | undefined | false> }) {
  const shown = lines.filter((l): l is string => !!l)
  if (shown.length === 0) return null
  return (
    <div className="flex flex-col mt-2">
      {shown.map(line => (
        <p key={line} className="story-detail">
          {line}
        </p>
      ))}
    </div>
  )
}

/** Flat share bar, no animation. */
export function ShareBar({ value, warm = false }: { value: number; warm?: boolean }) {
  return (
    <div className="h-1.5 w-full bg-[var(--border)]" aria-hidden="true">
      <div
        className="h-full"
        style={{
          width: `${Math.max(0, Math.min(1, value)) * 100}%`,
          backgroundColor: warm ? 'var(--warm)' : 'var(--text-primary)',
        }}
      />
    </div>
  )
}

/** Vertical stack with the spacing shared by every screen. */
export function Stack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-6 w-full">{children}</div>
}
