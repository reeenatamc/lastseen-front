'use client'

import { useTranslations } from 'next-intl'

export function PrivacyNote() {
  const t = useTranslations('landing')

  return (
    <section className="pt-16 pb-12 px-6 text-center">
      <p className="text-[11px] font-mono text-[var(--text-muted)] tracking-wide">
        {t('privacyNote')}
      </p>
    </section>
  )
}
