'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { LangToggle } from '@/components/ui/LangToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function LegalPage() {
  const t = useTranslations('legal')
  const privacyItems = t.raw('privacyItems') as string[]
  const termsItems = t.raw('termsItems') as string[]

  return (
    <div className="min-h-screen">
      <div className="px-4 md:px-8 py-6 flex items-center justify-between">
        <span className="text-xs font-mono text-[var(--text-muted)] tracking-widest uppercase">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            LASTSEEN
          </Link>
          {' / '}
          <span>{t('title')}</span>
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <LangToggle />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 md:px-6 pb-32 flex flex-col gap-16">
        <section aria-labelledby="privacy-title" className="flex flex-col gap-6">
          <h1
            id="privacy-title"
            className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono"
          >
            {t('privacyTitle')}
          </h1>
          <ul className="flex flex-col gap-4">
            {privacyItems.map(item => (
              <li key={item} className="text-sm font-mono text-[var(--text-primary)] leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm font-mono text-[var(--text-muted)] leading-relaxed">
            {t('contactLabel')} <span className="text-[var(--text-primary)]">{t('contact')}</span>
          </p>
        </section>

        <section aria-labelledby="terms-title" className="flex flex-col gap-6">
          <h2
            id="terms-title"
            className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono"
          >
            {t('termsTitle')}
          </h2>
          <ul className="flex flex-col gap-4">
            {termsItems.map(item => (
              <li key={item} className="text-sm font-mono text-[var(--text-primary)] leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm font-mono text-[var(--text-muted)] leading-relaxed">
            {t('refundsLabel')} <span className="text-[var(--text-primary)]">{t('refunds')}</span>
          </p>
        </section>

        <Link
          href="/"
          className="self-start text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-2"
        >
          {t('back')}
        </Link>
      </main>
    </div>
  )
}
