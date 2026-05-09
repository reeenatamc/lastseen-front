'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { LangToggle } from '@/components/ui/LangToggle'
import { fadeIn, fadeUp, EASE_OUT } from '@/lib/motion'

function SectionDivider() {
  return <hr className="border-none h-px bg-[var(--border)] my-0" />
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-[0.25em] uppercase mb-10">
      {children}
    </p>
  )
}

export default function LandingPage() {
  const t = useTranslations('landing')

  const features = [
    { title: t('feature1title'), description: t('feature1desc') },
    { title: t('feature2title'), description: t('feature2desc') },
    { title: t('feature3title'), description: t('feature3desc') },
  ]

  const steps = [t('step1'), t('step2'), t('step3')]

  const seen = [
    { title: t('seen1title'), desc: t('seen1desc') },
    { title: t('seen2title'), desc: t('seen2desc') },
    { title: t('seen3title'), desc: t('seen3desc') },
    { title: t('seen4title'), desc: t('seen4desc') },
  ]

  const coming = [
    { title: t('coming1title'), desc: t('coming1desc') },
    { title: t('coming2title'), desc: t('coming2desc') },
    { title: t('coming3title'), desc: t('coming3desc') },
  ]

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center px-5 py-12 md:py-24 text-center min-h-screen relative">
        <div className="absolute top-6 right-5 md:right-8">
          <LangToggle />
        </div>

        <motion.h1
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="text-5xl sm:text-7xl md:text-7xl lg:text-9xl tracking-tight text-[var(--text-primary)]"
          style={{ fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif', fontStyle: 'italic' }}
        >
          LASTSEEN
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ ...EASE_OUT, delay: 0.2 }}
          className="mt-6 text-base md:text-lg font-mono text-[var(--text-muted)] tracking-wide max-w-md"
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

      <SectionDivider />

      {/* ── Features ── */}
      <section className="px-5 md:px-6 py-16 md:py-24 max-w-2xl mx-auto w-full">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ ...EASE_OUT, delay: 0.1 + i * 0.1 }}
          >
            {i > 0 && <hr className="border-none h-px bg-[var(--border)] my-10" />}
            <div className="py-2">
              <p className="text-sm font-mono text-[var(--text-primary)] tracking-wide">
                {feature.title}{' '}
                <span className="text-[var(--text-muted)]">{feature.description}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </section>

      <SectionDivider />

      {/* ── How it works ── */}
      <section className="px-5 md:px-6 py-16 md:py-24 max-w-2xl mx-auto w-full">
        <SectionTitle>{t('howTitle')}</SectionTitle>
        <div className="flex flex-col gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...EASE_OUT, delay: 0.1 + i * 0.1 }}
              className="flex gap-6 items-start"
            >
              <span className="text-xs font-mono text-[var(--border)] pt-0.5 shrink-0">
                0{i + 1}
              </span>
              <p className="text-sm font-mono text-[var(--text-muted)] leading-relaxed">
                {step}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ── What you'll see ── */}
      <section className="px-5 md:px-6 py-16 md:py-24 max-w-2xl mx-auto w-full">
        <SectionTitle>{t('seenTitle')}</SectionTitle>
        <div className="flex flex-col gap-10">
          {seen.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...EASE_OUT, delay: 0.1 + i * 0.08 }}
            >
              <p
                className="text-lg mb-2 text-[var(--text-primary)]"
                style={{ fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif', fontStyle: 'italic' }}
              >
                {item.title}
              </p>
              <p className="text-sm font-mono text-[var(--text-muted)] leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ── Coming next ── */}
      <section className="px-5 md:px-6 py-16 md:py-24 max-w-2xl mx-auto w-full">
        <SectionTitle>{t('comingTitle')}</SectionTitle>
        <div className="flex flex-col gap-8">
          {coming.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...EASE_OUT, delay: 0.1 + i * 0.1 }}
              className="flex gap-6 items-start"
            >
              <span className="text-xs font-mono text-[var(--border)] pt-0.5 shrink-0 mt-1">→</span>
              <div>
                <p className="text-sm font-mono text-[var(--text-primary)] mb-1">{item.title}</p>
                <p className="text-sm font-mono text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ── Bottom CTA ── */}
      <section className="px-5 md:px-6 py-16 md:py-24 flex flex-col items-center text-center gap-8">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-xl md:text-2xl lg:text-3xl text-[var(--text-muted)]"
          style={{ fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif', fontStyle: 'italic' }}
        >
          {t('closing')}
        </motion.p>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ ...EASE_OUT, delay: 0.2 }}>
          <Link
            href="/auth"
            className="inline-flex items-center px-8 py-4 border border-[var(--border)] text-sm font-mono text-[var(--text-muted)] tracking-widest uppercase hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-300"
          >
            {t('ctaBottom')}
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-5 md:px-6 py-8 border-t border-[var(--border)]">
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
