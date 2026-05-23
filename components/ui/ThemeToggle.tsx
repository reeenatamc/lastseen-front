'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function ThemeToggle() {
  const t = useTranslations('theme')
  const [mounted, setMounted] = useState(false)
  const [isLight, setIsLight] = useState(false)

  // Theme is only known client-side (set by the no-FOUC script in the
  // root layout), so read it after mount to avoid a hydration mismatch.
  useEffect(() => {
    setMounted(true)
    setIsLight(document.documentElement.classList.contains('theme-light'))
  }, [])

  const toggle = () => {
    const next = !isLight
    document.documentElement.classList.toggle('theme-light', next)
    try {
      localStorage.setItem('theme', next ? 'light' : 'dark')
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
    setIsLight(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? t('toDark') : t('toLight')}
      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
    >
      {mounted && (isLight ? <MoonIcon /> : <SunIcon />)}
    </button>
  )
}
