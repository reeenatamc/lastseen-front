'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

interface SilenceMapProps {
  byMonth: Array<{ period: string; count: number }>
}

export function SilenceMap({ byMonth }: SilenceMapProps) {
  const t = useTranslations('charts')
  const data = useMemo(() => {
    if (!byMonth.length) return []
    const maxCount = Math.max(...byMonth.map(d => d.count), 1)
    return byMonth.map(d => ({
      ...d,
      intensity: d.count / maxCount, // 0 = dark (silence), 1 = light (active)
    }))
  }, [byMonth])

  if (!data.length) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
        <span>{t('silenceLegend')}</span>
        <div className="flex gap-0.5" aria-hidden="true">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map(v => (
            <div key={v} className="w-3 h-3" style={{ backgroundColor: intensityToColor(v) }} />
          ))}
        </div>
        <span>{t('activeLegend')}</span>
      </div>

      <ul className="flex flex-wrap gap-1" aria-label={t('silenceMap')}>
        {data.map(d => (
          <li
            key={d.period}
            className="w-5 h-5 md:w-6 md:h-6"
            style={{ backgroundColor: intensityToColor(d.intensity) }}
            title={`${d.period}: ${t('tooltipMessages', { count: d.count })}`}
          />
        ))}
      </ul>
    </div>
  )
}

function intensityToColor(intensity: number): string {
  // 0 (silence) = darkest, 1 (active) = lighter, mixed from theme variables
  const pct = Math.round(Math.max(0, Math.min(1, intensity)) * 100)
  return `color-mix(in srgb, var(--text-muted) ${pct}%, var(--border))`
}
