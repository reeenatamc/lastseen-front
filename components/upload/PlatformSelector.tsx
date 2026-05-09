'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

type Platform = 'whatsapp' | 'telegram' | 'imessage'

interface PlatformOption {
  id: Platform
  available: boolean
}

const PLATFORM_OPTIONS: PlatformOption[] = [
  { id: 'whatsapp', available: true },
  { id: 'telegram', available: false },
  { id: 'imessage', available: false },
]

interface PlatformSelectorProps {
  selected: Platform
  onSelect: (platform: Platform) => void
}

export function PlatformSelector({ selected, onSelect }: PlatformSelectorProps) {
  const t = useTranslations('upload')

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono">
        {t('platformLabel')}
      </span>
      <div className="flex gap-3">
        {PLATFORM_OPTIONS.map((platform, i) => {
          const label = platform.id === 'whatsapp'
            ? t('whatsapp')
            : platform.id === 'telegram'
            ? 'Telegram'
            : 'iMessage'
          return (
            <motion.button
              key={platform.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onClick={() => platform.available && onSelect(platform.id)}
              disabled={!platform.available}
              className={`
                px-4 py-2 text-xs font-mono tracking-widest uppercase border transition-colors duration-200
                ${!platform.available
                  ? 'border-[var(--border)] text-[var(--text-muted)] cursor-not-allowed opacity-40'
                  : selected === platform.id
                  ? 'border-[var(--text-primary)] text-[var(--text-primary)] cursor-pointer'
                  : 'border-[var(--border)] text-[var(--text-muted)] cursor-pointer hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              {label}
              {!platform.available && (
                <span className="ml-2 text-[0.6rem] normal-case tracking-normal">{t('comingSoon')}</span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
