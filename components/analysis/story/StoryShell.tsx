'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { LangToggle } from '@/components/ui/LangToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export interface StoryScreen {
  id: string
  node: ReactNode
}

interface StoryShellProps {
  screens: StoryScreen[]
  /** Shows the "My reports" link in the header */
  signedIn: boolean
}

const FADE_MS = 200
const SWIPE_PX = 50

const NAV_BUTTON =
  'min-h-[44px] min-w-[44px] px-3 text-[0.8125rem] font-mono uppercase tracking-widest transition-colors outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]'

export function StoryShell({ screens, signedIn }: StoryShellProps) {
  const t = useTranslations('story')
  const tReports = useTranslations('reports')
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState(true)
  const busy = useRef(false)
  const reduced = useRef(false)
  const touch = useRef<{ x: number; y: number } | null>(null)

  const total = screens.length
  const current = Math.min(index, total - 1)

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const goTo = useCallback(
    (target: number) => {
      if (target < 0 || target >= total || target === current || busy.current) return
      if (reduced.current) {
        setIndex(target)
        return
      }
      busy.current = true
      setShown(false)
      window.setTimeout(() => {
        setIndex(target)
        setShown(true)
        busy.current = false
      }, FADE_MS)
    },
    [current, total],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
      if (e.key === 'ArrowRight') goTo(current + 1)
      else if (e.key === 'ArrowLeft') goTo(current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, goTo])

  const onTouchStart = (e: React.TouchEvent) => {
    const p = e.touches[0]
    touch.current = { x: p.clientX, y: p.clientY }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current
    touch.current = null
    if (!start) return
    const p = e.changedTouches[0]
    const dx = p.clientX - start.x
    const dy = p.clientY - start.y
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) <= Math.abs(dy)) return
    goTo(dx < 0 ? current + 1 : current - 1)
  }

  const isFirst = current === 0
  const isLast = current === total - 1

  return (
    <div
      className="h-[100dvh] overflow-hidden flex flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <header className="shrink-0 px-4 md:px-8 pt-3 flex flex-col gap-3">
        <div
          role="progressbar"
          aria-label={t('progress')}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={current + 1}
          aria-valuetext={t('counter', { current: current + 1, total })}
          className="flex gap-1"
        >
          {screens.map((s, i) => (
            <div
              key={s.id}
              className="h-0.5 flex-1"
              style={{ backgroundColor: i <= current ? 'var(--text-primary)' : 'var(--border)' }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-mono text-[var(--text-muted)] tracking-widest uppercase hover:text-[var(--text-primary)] transition-colors outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
          >
            LASTSEEN
          </Link>
          <div className="flex items-center gap-4">
            {signedIn && (
              <Link
                href="/analyses"
                className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-2 outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
              >
                {tReports('link')}
              </Link>
            )}
            <ThemeToggle />
            <LangToggle />
          </div>
        </div>
      </header>

      <main
        aria-live="polite"
        className="flex-1 min-h-0 overflow-y-auto px-6 flex flex-col"
        style={{ opacity: shown ? 1 : 0, transition: reduced.current ? undefined : `opacity ${FADE_MS}ms linear` }}
      >
        <div key={screens[current].id} className="m-auto w-full max-w-[760px] py-6">
          {screens[current].node}
        </div>
      </main>

      <nav className="shrink-0 px-4 md:px-8 pb-4 pt-2 grid grid-cols-3 items-center">
        <div>
          {!isFirst && (
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              className={`${NAV_BUTTON} text-[var(--text-muted)] hover:text-[var(--text-primary)]`}
            >
              {t('back')}
            </button>
          )}
        </div>
        <span className="text-center text-xs font-mono text-[var(--text-detail)]">
          {t('counter', { current: current + 1, total })}
        </span>
        <div className="flex justify-end">
          {!isLast && (
            <button
              type="button"
              onClick={() => goTo(current + 1)}
              className={`${NAV_BUTTON} ${
                isFirst
                  ? 'bg-[var(--text-primary)] text-[var(--background)] px-5 hover:opacity-90'
                  : 'text-[var(--text-primary)] hover:text-[var(--warm)]'
              }`}
            >
              {t('next')}
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}
