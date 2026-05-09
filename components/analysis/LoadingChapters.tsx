'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { fadeIn } from '@/lib/motion'

export function LoadingChapters() {
  const t = useTranslations('analysis')
  const PHRASES = [t('loading1'), t('loading2'), t('loading3')]
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % PHRASES.length)
    }, 2800)
    return () => clearInterval(timer)
  }, [PHRASES.length])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[var(--background)]">
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIndex}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-2xl md:text-3xl font-serif italic text-[var(--text-primary)] text-center px-8"
            style={{ fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif' }}
          >
            {PHRASES[phraseIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Indeterminate progress line at bottom */}
      <div className="w-full h-px bg-[var(--border)] overflow-hidden">
        <motion.div
          className="h-full bg-[var(--text-muted)] progress-indeterminate"
          style={{ width: '25%' }}
        />
      </div>
    </div>
  )
}
