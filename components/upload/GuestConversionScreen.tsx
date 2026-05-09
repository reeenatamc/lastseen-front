'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { fadeUp, EASE_OUT } from '@/lib/motion'

export function GuestConversionScreen() {
  const t = useTranslations('guest')

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="text-2xl md:text-3xl text-[var(--text-muted)] mb-3"
        style={{ fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif', fontStyle: 'italic' }}
      >
        {t('title')}
      </motion.p>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ ...EASE_OUT, delay: 0.15 }}
        className="text-sm font-mono text-[var(--text-muted)] mb-10 max-w-sm leading-relaxed"
      >
        {t('subtitle')}
      </motion.p>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ ...EASE_OUT, delay: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <Link
          href="/auth"
          className="inline-flex items-center px-8 py-4 bg-[var(--text-primary)] text-[var(--background)] text-xs font-mono tracking-widest uppercase hover:bg-white transition-colors duration-300"
        >
          {t('cta')}
        </Link>
        <p className="text-[11px] font-mono text-[var(--border)]">
          {t('free')}
        </p>
      </motion.div>
    </div>
  )
}
