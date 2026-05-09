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

  const silentMonths = data.filter(d => d.intensity < 0.2).length
  const description = silentMonths === 0
    ? 'Every month had activity — no complete breaks in the conversation.'
    : silentMonths === 1
    ? 'One month went almost silent. A single gap in an otherwise active thread.'
    : `${silentMonths} months with very little activity. The gaps tell their own story.`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono">
          {t('silenceMap')}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--text-muted)]">{t('silenceLegend')}</span>
          <div className="flex gap-0.5">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map(v => (
              <div
                key={v}
                className="w-3 h-3"
                style={{ backgroundColor: intensityToColor(v) }}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)]">{t('activeLegend')}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {data.map((d) => (
          <div key={d.period} className="group relative">
            <div
              className="w-6 h-6 cursor-default"
              style={{ backgroundColor: intensityToColor(d.intensity) }}
              title={`${d.period}: ${d.count} messages`}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 pointer-events-none">
              <div className="bg-[var(--surface)] border border-[var(--border)] px-2 py-1 text-[0.65rem] font-mono text-[var(--text-muted)] whitespace-nowrap">
                {d.period}
                <br />
                {d.count} msg
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function intensityToColor(intensity: number): string {
  // 0 (silence) = darkest (#1a1a1a), 1 (active) = lighter (#f0f0f0 dimmed to ~#888)
  const dark = [26, 26, 26]
  const light = [136, 136, 136]
  const r = Math.round(dark[0] + (light[0] - dark[0]) * intensity)
  const g = Math.round(dark[1] + (light[1] - dark[1]) * intensity)
  const b = Math.round(dark[2] + (light[2] - dark[2]) * intensity)
  return `rgb(${r},${g},${b})`
}
