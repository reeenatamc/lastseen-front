'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { LangToggle } from '@/components/ui/LangToggle'
import { fadeIn, fadeUp, EASE_OUT } from '@/lib/motion'

export default function LandingPage() {
  const t = useTranslations('landing')

  const features = [
    { title: t('feature1title'), description: t('feature1desc') },
    { title: t('feature2title'), description: t('feature2desc') },
    { title: t('feature3title'), description: t('feature3desc') },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center min-h-screen relative">
        {/* Lang toggle top-right */}
        <div className="absolute top-6 right-8">
          <LangToggle />
        </div>

        <motion.h1
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="text-7xl md:text-9xl tracking-tight text-[var(--text-primary)]"
          style={{ fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif', fontStyle: 'italic' }}
        >
          LASTSEEN
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ ...EASE_OUT, delay: 0.2 }}
          className="mt-6 text-base md:text-lg font-mono text-[var(--text-muted)] tracking-wide"
        >
          {t('tagline')}
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ ...EASE_OUT, delay: 0.4 }}
          className="mt-12"
        >
          <Link
            href="/auth"
            className="inline-flex items-center px-8 py-4 bg-[var(--text-primary)] text-[var(--background)] text-sm font-mono tracking-widest uppercase hover:bg-white transition-colors duration-300"
          >
            {t('cta')}
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 max-w-2xl mx-auto w-full">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ ...EASE_OUT, delay: 0.6 + i * 0.1 }}
          >
            {i > 0 && (
              <hr className="border-none h-px bg-[var(--border)] my-10" />
            )}
            <div className="py-2">
              <p className="text-sm font-mono text-[var(--text-primary)] tracking-wide">
                {feature.title}{' '}
                <span className="text-[var(--text-muted)]">{feature.description}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span
            className="text-sm text-[var(--text-muted)]"
            style={{ fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif', fontStyle: 'italic' }}
          >
            LASTSEEN
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)] tracking-wide">
            {t('footer')}
          </span>
        </div>
      </footer>
    </div>
  )
}
