'use client'

import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('landing')

  return (
    <footer className="border-t border-[var(--border)] px-6 py-5">
      <div className="max-w-[560px] mx-auto flex items-center justify-between">
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          LASTSEEN
        </span>
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          {t('footerRight')}
        </span>
      </div>
    </footer>
  )
}
