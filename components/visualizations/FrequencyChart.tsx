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
  /** Chart height in px */
  height?: number
}

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 0,
  fontFamily: 'var(--font-geist-mono, monospace)',
  fontSize: 11,
  color: 'var(--text-primary)',
}

export function FrequencyChart({ byMonth, height = 200 }: FrequencyChartProps) {
  const t = useTranslations('charts')
  if (!byMonth.length) return null

  const maxCount = Math.max(...byMonth.map(d => d.count))

  return (
    <div style={{ height }} role="img" aria-label={t('frequencyChart')}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={byMonth} margin={{ top: 4, right: 4, bottom: 0, left: -16 }} barCategoryGap="20%">
          <CartesianGrid stroke="var(--border)" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="period"
            tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            interval={Math.ceil(byMonth.length / 6) - 1}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            itemStyle={{ color: 'var(--text-primary)' }}
            labelStyle={{ color: 'var(--text-muted)', marginBottom: 4 }}
            cursor={{ fill: 'var(--border)' }}
            separator=""
            formatter={value => [t('tooltipMessages', { count: Number(value) }), '']}
          />
          <Bar dataKey="count" radius={0} isAnimationActive={false}>
            {byMonth.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.count > maxCount * 0.6 ? 'var(--text-primary)' : 'var(--text-muted)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
