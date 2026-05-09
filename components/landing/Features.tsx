'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export function Features() {
  const t = useTranslations('landing')

  const blocks = [
    { title: t('block1title'), desc: t('block1desc') },
    { title: t('block2title'), desc: t('block2desc') },
    { title: t('block3title'), desc: t('block3desc') },
  ]

  return (
    <section className="max-w-[560px] mx-auto w-full px-6">
      {blocks.map((block, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.15 }}
        >
          <hr className="border-none h-px bg-[var(--border)]" />
          <div className="py-10">
            <p className="text-sm font-mono text-[var(--text-primary)] tracking-wide mb-3">
              {block.title}
            </p>
            <p className="text-sm font-mono text-[var(--text-muted)] leading-relaxed">
              {block.desc}
            </p>
          </div>
        </motion.div>
      ))}
      <hr className="border-none h-px bg-[var(--border)]" />
    </section>
  )
}
