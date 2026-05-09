'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useTranslations } from 'next-intl'

interface FrequencyChartProps {
  byMonth: Array<{ period: string; count: number }>
}

const TOOLTIP_STYLE = {
  backgroundColor: '#111111',
  border: '1px solid #1f1f1f',
  borderRadius: 0,
  fontFamily: 'var(--font-geist-mono, monospace)',
  fontSize: 11,
  color: '#f0f0f0',
}

export function FrequencyChart({ byMonth }: FrequencyChartProps) {
  const t = useTranslations('charts')
  if (!byMonth.length) return null

  const maxCount = Math.max(...byMonth.map(d => d.count))

  return (
    <div className="flex flex-col gap-4">
      <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono">
        {t('frequencyChart')}
      </span>

      <div className="h-44 md:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byMonth} margin={{ top: 4, right: 4, bottom: 0, left: -16 }} barCategoryGap="20%">
            <CartesianGrid stroke="#1f1f1f" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fill: '#555555', fontSize: 9, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              interval={Math.ceil(byMonth.length / 8) - 1}
            />
            <YAxis
              tick={{ fill: '#555555', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={{ color: '#f0f0f0' }}
              labelStyle={{ color: '#555555', marginBottom: 4 }}
              cursor={{ fill: '#1f1f1f' }}
            />
            <Bar dataKey="count" radius={0}>
              {byMonth.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.count > maxCount * 0.6 ? '#f0f0f0' : '#2a2a2a'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
