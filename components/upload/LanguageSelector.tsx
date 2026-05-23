'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

type Language = 'es' | 'en'

const LANGUAGE_OPTIONS: Language[] = ['es', 'en']

interface LanguageSelectorProps {
  selected: Language
  onSelect: (language: Language) => void
}

export function LanguageSelector({ selected, onSelect }: LanguageSelectorProps) {
  const t = useTranslations('upload')

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono">
        {t('languageLabel')}
      </span>
      <div className="flex flex-wrap gap-3">
        {LANGUAGE_OPTIONS.map((language, i) => {
          const label = language === 'es' ? t('languageEs') : t('languageEn')
          return (
            <motion.button
              key={language}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onClick={() => onSelect(language)}
              className={`
                min-h-[44px] px-4 py-2 text-xs font-mono tracking-widest uppercase border transition-colors duration-200
                ${selected === language
                  ? 'border-[var(--text-primary)] text-[var(--text-primary)] cursor-pointer'
                  : 'border-[var(--border)] text-[var(--text-muted)] cursor-pointer hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              {label}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
