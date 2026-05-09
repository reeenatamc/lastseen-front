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
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {t('footerRight')}
          </span>
          <a
            href="https://github.com/reeenatamc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-[var(--border)] hover:text-[var(--text-muted)] transition-colors duration-200"
          >
            {t('footerBy')}
          </a>
        </div>
      </div>
    </footer>
  )
}
