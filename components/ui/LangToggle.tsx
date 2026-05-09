'use client'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'

export function LangToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('lang')

  const toggle = () => {
    const next = locale === 'es' ? 'en' : 'es'
    router.replace(pathname, { locale: next })
  }

  return (
    <button
      onClick={toggle}
      className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors tracking-widest"
    >
      {t('toggle')}
    </button>
  )
}
