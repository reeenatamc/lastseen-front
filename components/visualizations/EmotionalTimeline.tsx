'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useTranslations } from 'next-intl'

interface EmotionalTimelineProps {
  evolution: Array<{ period: string } & Record<string, number>>
  participants: string[]
}

// Determine which participant trends more negative overall to mark in warm color
function getParticipantAvg(
  evolution: Array<{ period: string } & Record<string, number>>,
  p: string
): number {
  const vals = evolution.map(e => e[p]).filter((v): v is number => typeof v === 'number')
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function getTrend(
  evolution: Array<{ period: string } & Record<string, number>>,
  p: string
): 'rising' | 'falling' | 'flat' {
  const vals = evolution.map(e => e[p]).filter((v): v is number => typeof v === 'number')
  if (vals.length < 2) return 'flat'
  const half = Math.floor(vals.length / 2)
  const first = vals.slice(0, half).reduce((a, b) => a + b, 0) / half
  const last = vals.slice(half).reduce((a, b) => a + b, 0) / (vals.length - half)
  if (last - first > 0.1) return 'rising'
  if (first - last > 0.1) return 'falling'
  return 'flat'
}

function getWarmParticipant(
  evolution: Array<{ period: string } & Record<string, number>>,
  participants: string[]
): string | null {
  if (participants.length < 2) return null

  const avgs = participants.map(p => ({ p, avg: getParticipantAvg(evolution, p) }))
  avgs.sort((a, b) => a.avg - b.avg)
  return avgs[0].avg < 0 ? avgs[0].p : null
}

function buildDescription(
  evolution: Array<{ period: string } & Record<string, number>>,
  participants: string[]
): string {
  if (participants.length < 2) return ''

  const [p1, p2] = participants
  const avg1 = getParticipantAvg(evolution, p1)
  const avg2 = getParticipantAvg(evolution, p2)
  const drift = Math.abs(avg1 - avg2)
  const trend1 = getTrend(evolution, p1)
  const trend2 = getTrend(evolution, p2)
  const bothFalling = trend1 === 'falling' && trend2 === 'falling'
  const bothRising = trend1 === 'rising' && trend2 === 'rising'

  if (drift < 0.1) {
    if (bothFalling) return 'Both of you pulled back emotionally as time went on — the warmth faded at the same pace.'
    if (bothRising) return 'The emotional energy between you grew over time. Both moving in the same direction.'
    return 'Emotionally in sync — the tone of this conversation has been consistent across time.'
  }

  const warmer = avg1 > avg2 ? p1 : p2
  const cooler = avg1 > avg2 ? p2 : p1

  if (drift > 0.4) return `A visible emotional gap. ${warmer.split(' ')[0]} brought warmth; ${cooler.split(' ')[0]} responded with distance.`
  if (bothFalling) return `Both tones declined, but the gap between you remained. The conversation cooled together.`
  return `${warmer.split(' ')[0]} carried more warmth throughout. ${cooler.split(' ')[0]} stayed in a more measured register.`
}

const TOOLTIP_STYLE = {
  backgroundColor: '#111111',
  border: '1px solid #1f1f1f',
  borderRadius: 0,
  fontFamily: 'var(--font-geist-mono, monospace)',
  fontSize: 11,
  color: '#f0f0f0',
}

export function EmotionalTimeline({ evolution, participants }: EmotionalTimelineProps) {
  const t = useTranslations('charts')
  const warmParticipant = getWarmParticipant(evolution, participants)
  const description = buildDescription(evolution, participants)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono shrink-0">
          {t('emotionalTimeline')}
        </span>
        <div className="flex gap-3 flex-wrap">
          {participants.map(p => (
            <span key={p} className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] min-w-0">
              <span
                className="inline-block w-3 h-px shrink-0"
                style={{
                  backgroundColor: p === warmParticipant ? 'var(--warm)' : 'var(--text-primary)',
                }}
              />
              <span className="truncate max-w-[120px]">{p}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="h-44 md:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={evolution} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="#1f1f1f" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fill: '#555555', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[-1, 1]}
              tick={{ fill: '#555555', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              tickCount={5}
            />
            <ReferenceLine y={0} stroke="#1f1f1f" />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={{ color: '#f0f0f0' }}
              labelStyle={{ color: '#555555', marginBottom: 4 }}
            />
            {participants.map(p => (
              <Line
                key={p}
                type="monotone"
                dataKey={p}
                stroke={p === warmParticipant ? '#c8a96e' : '#f0f0f0'}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: p === warmParticipant ? '#c8a96e' : '#f0f0f0' }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
