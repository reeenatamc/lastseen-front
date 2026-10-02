'use client'

import { useId } from 'react'
import { motion } from 'framer-motion'
import { useFormatter, useTranslations } from 'next-intl'

interface DateRangeSelectorProps {
  range: { first: string; last: string } | null
  value: { from: string; to: string } | null
  onChange: (value: { from: string; to: string } | null) => void
}

const INPUT_CLASS =
  'min-h-[44px] px-3 py-2 text-xs font-mono border border-[var(--border)] bg-transparent text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-muted)]'

export function DateRangeSelector({ range, value, onChange }: DateRangeSelectorProps) {
  const t = useTranslations('upload')
  const format = useFormatter()
  const fromId = useId()
  const toId = useId()

  if (!range) return null

  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number)
    return format.dateTime(new Date(y, m - 1, d), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const custom = value !== null
  const options = [
    { key: 'all', label: t('periodAll'), active: !custom },
    { key: 'custom', label: t('periodCustom'), active: custom },
  ]

  const select = (key: string) => {
    if (key === 'all') onChange(null)
    else if (!custom) onChange({ from: range.first, to: range.last })
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono">
        {t('periodLabel')}
      </span>
      <div className="flex flex-wrap gap-3">
        {options.map((option, i) => (
          <motion.button
            key={option.key}
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            onClick={() => select(option.key)}
            className={`
              min-h-[44px] px-4 py-2 text-xs font-mono tracking-widest uppercase border transition-colors duration-200
              ${option.active
                ? 'border-[var(--text-primary)] text-[var(--text-primary)] cursor-pointer'
                : 'border-[var(--border)] text-[var(--text-muted)] cursor-pointer hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }
            `}
          >
            {option.label}
          </motion.button>
        ))}
      </div>
      <p className="text-xs font-mono text-[var(--text-muted)]">
        {t('periodDetected', {
          first: formatDate(range.first),
          last: formatDate(range.last),
        })}
      </p>
      {value && (
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-2">
            <label
              htmlFor={fromId}
              className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono"
            >
              {t('periodFrom')}
            </label>
            <input
              id={fromId}
              type="date"
              value={value.from}
              min={range.first}
              max={value.to}
              onChange={e => e.target.value && onChange({ from: e.target.value, to: value.to })}
              className={INPUT_CLASS}
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor={toId}
              className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono"
            >
              {t('periodTo')}
            </label>
            <input
              id={toId}
              type="date"
              value={value.to}
              min={value.from}
              max={range.last}
              onChange={e => e.target.value && onChange({ from: value.from, to: e.target.value })}
              className={INPUT_CLASS}
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
