'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export function Footer() {
  const t = useTranslations('landing')
  const tLegal = useTranslations('legal')

  return (
    <footer className="border-t border-[var(--border)] px-6 py-5">
      <div className="max-w-[560px] mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          LASTSEEN
        </span>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {t('footerRight')}
          </span>
          <Link
            href="/legal"
            className="text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200"
          >
            {tLegal('link')}
          </Link>
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
