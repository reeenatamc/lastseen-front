'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { LangToggle } from '@/components/ui/LangToggle'

export function Hero() {
  const t = useTranslations('landing')

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {/* Lang toggle */}
      <div className="absolute top-6 right-5 md:right-8">
        <LangToggle />
      </div>

      {/* LASTSEEN */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-5xl md:text-[72px] leading-none text-[var(--text-primary)]"
        style={{ fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif', fontStyle: 'italic' }}
      >
        LASTSEEN
      </motion.h1>

      {/* Thin rule */}
      <motion.hr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        className="border-none h-px bg-[var(--border)] w-40 my-6"
      />

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.4 }}
        className="text-lg md:text-xl text-[var(--text-muted)] leading-relaxed"
        style={{ fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif', fontStyle: 'italic' }}
      >
        {t('tagline')}
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.6 }}
        className="mt-10 flex flex-col items-center gap-4"
      >
        <Link
          href="/auth"
          className="inline-flex items-center px-7 py-3 bg-[var(--text-primary)] text-[var(--background)] text-xs font-mono tracking-widest uppercase transition-colors duration-200 hover:bg-[var(--text-muted)]"
        >
          {t('cta')}
        </Link>

        <Link
          href="/upload"
          className="text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200 tracking-wide"
        >
          {t('tryWithoutAccount')}
        </Link>
      </motion.div>

      {/* Counter */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.8 }}
        className="absolute bottom-8 text-[10px] font-mono text-[var(--border)] tracking-widest"
      >
        {t('counter')}
      </motion.p>
    </section>
  )
}
