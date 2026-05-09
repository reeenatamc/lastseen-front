'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { formatDate } from '@/lib/utils'
import { fadeUp } from '@/lib/motion'

function formatPeriod(period: string, months: string[]): string {
  const quarterly = period.match(/^(\d{4})-Q(\d)$/)
  if (quarterly) return `Q${quarterly[2]} ${quarterly[1]}`
  const monthly = period.match(/^(\d{4})-(\d{2})$/)
  if (monthly) return `${months[parseInt(monthly[2], 10) - 1]} ${monthly[1]}`
  return period
}

interface BarProps {
  value: number // 0–1
  label?: string
  warm?: boolean
}

function HorizontalBar({ value, label, warm }: BarProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-mono text-[var(--text-muted)] tracking-wide truncate">{label}</span>
      )}
      <div className="h-1.5 w-full bg-[var(--border)] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full"
          style={{ backgroundColor: warm ? 'var(--warm)' : 'var(--text-primary)' }}
        />
      </div>
    </div>
  )
}

// Initiative Balance card
interface InitiativeCardProps {
  share: Record<string, number>
  participants: string[]
  doubleText?: { per_person: Record<string, number>; share: Record<string, number>; total: number }
}

export function InitiativeCard({ share, participants, doubleText }: InitiativeCardProps) {
  const t = useTranslations('metrics')
  return (
    <MetricCardWrapper title={t('initiativeBalance')}>
      <div className="flex flex-col gap-5 mt-4">
        <div className="flex flex-col gap-3">
          {participants.map(p => (
            <HorizontalBar key={p} value={share[p] ?? 0} label={p} />
          ))}
        </div>

        {doubleText && doubleText.total > 0 && (
          <>
            <div className="h-px bg-[var(--border)]" />
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase">
                {t('followedUpUnanswered')}
              </span>
              <div className="flex gap-3 flex-wrap">
                {participants.map(p => {
                  const count = doubleText.per_person[p] ?? 0
                  if (!count) return null
                  return (
                    <span key={p} className="text-xs font-mono text-[var(--text-muted)]">
                      {p.split(' ')[0]}
                      <span className="ml-1" style={{ color: 'var(--warm)' }}>{count}×</span>
                    </span>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </MetricCardWrapper>
  )
}

// Response Decay card
interface ResponseDecayCardProps {
  decayScore: number
  trend: 'deteriorating' | 'stable' | 'improving'
  turningPoint: string | null
  responseTimes?: Record<string, { mean_seconds: number }>
}

function formatSeconds(s: number): string {
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.round(s / 60)}m`
  if (s < 86400) return `${(s / 3600).toFixed(1)}h`
  return `${(s / 86400).toFixed(1)}d`
}

export function ResponseDecayCard({ decayScore, trend, turningPoint, responseTimes }: ResponseDecayCardProps) {
  const t = useTranslations('metrics')
  const months = useTranslations('months')
  const monthNames = Array.from({ length: 12 }, (_, i) => months(`${i}` as any))

  const TREND_LABELS: Record<string, string> = {
    deteriorating: t('worseningOverTime'),
    stable: t('holdingSteady'),
    improving: t('recovering'),
  }

  return (
    <MetricCardWrapper title={t('responseDecay')}>
      <div className="flex flex-col gap-4 mt-4">
        <HorizontalBar value={decayScore} warm={decayScore > 0.6} />
        <span className="text-xs font-mono text-[var(--text-muted)]">
          {TREND_LABELS[trend] ?? trend}
        </span>
        {turningPoint && (
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {t('shiftedIn')}{' '}
            <span style={{ color: 'var(--warm)' }}>{formatPeriod(turningPoint, monthNames)}</span>
          </span>
        )}
        {responseTimes && Object.keys(responseTimes).length > 0 && (
          <>
            <div className="h-px bg-[var(--border)]" />
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase">
                {t('avgResponseTime')}
              </span>
              {Object.entries(responseTimes).map(([p, rt]) => (
                <div key={p} className="flex justify-between items-center">
                  <span className="text-xs font-mono text-[var(--text-muted)] truncate max-w-[70%]">{p}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
                    {formatSeconds(rt.mean_seconds)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </MetricCardWrapper>
  )
}

// Silence Onset card
interface SilenceOnsetCardProps {
  days: number
  start: string
}

export function SilenceOnsetCard({ days, start }: SilenceOnsetCardProps) {
  const t = useTranslations('metrics')
  const formatted = formatDate(start)
  const value = days < 1 ? Math.round(days * 24) : Math.round(days)
  const unit = days < 1 ? t('hours') : days === 1 ? t('day') : t('days')

  const description =
    days < 1
      ? t('silenceBrief')
      : days < 3
      ? t('silenceShort')
      : days < 7
      ? t('silenceLong')
      : t('silenceWeek')

  return (
    <MetricCardWrapper title={t('silenceOnset')}>
      <div className="flex flex-col gap-3 mt-4">
        <span
          className="text-3xl"
          style={{
            fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif',
            color: 'var(--warm)',
          }}
        >
          {value}
          <span className="text-base ml-1 font-mono" style={{ color: 'var(--text-muted)' }}>
            {unit}
          </span>
        </span>
        <span className="text-xs font-mono text-[var(--text-muted)]">
          {t('firstMajorSilence')}: {formatted}
        </span>
        <div className="h-px bg-[var(--border)]" />
        <p
          className="text-sm leading-relaxed text-[var(--text-muted)]"
          style={{ fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif', fontStyle: 'italic' }}
        >
          {description}
        </p>
      </div>
    </MetricCardWrapper>
  )
}

// Emotional Drift card
interface SentimentPerson {
  dominant: string
  avg_score: number
  positive: number
  negative: number
  neutral: number
}

interface EmotionalDriftCardProps {
  score: number
  direction: string
  hasError: boolean
  sentimentPerPerson?: Record<string, SentimentPerson>
}

function humanizeDirection(direction: string): string {
  // e.g. "Alice_positive_Bob_negative" → "Alice positive · Bob negative"
  return direction
    .replace(/_positive/g, ' positive')
    .replace(/_negative/g, ' negative')
    .replace(/_neutral/g, ' neutral')
    .replace(/_/g, ' · ')
}

export function EmotionalDriftCard({ score, direction, hasError, sentimentPerPerson }: EmotionalDriftCardProps) {
  const t = useTranslations('metrics')

  const TONE_LABEL: Record<string, string> = {
    positive: t('warm'),
    neutral: t('neutral'),
    negative: t('distant'),
  }

  return (
    <MetricCardWrapper title={t('emotionalDrift')}>
      {hasError ? (
        <div className="mt-4">
          <span className="text-2xl font-mono text-[var(--text-muted)]">—</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          <HorizontalBar value={score} warm={score > 0.5} />
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {score < 0.15 ? t('emotionallyAligned') : humanizeDirection(direction)}
          </span>
          {sentimentPerPerson && Object.keys(sentimentPerPerson).length > 0 && (
            <>
              <div className="h-px bg-[var(--border)]" />
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase">
                  {t('tonePerPerson')}
                </span>
                {Object.entries(sentimentPerPerson).map(([p, s]) => (
                  <div key={p} className="flex justify-between items-center">
                    <span className="text-xs font-mono text-[var(--text-muted)] truncate max-w-[70%]">{p}</span>
                    <span
                      className="text-xs font-mono"
                      style={{ color: s.dominant === 'positive' ? 'var(--warm)' : 'var(--text-muted)' }}
                    >
                      {TONE_LABEL[s.dominant] ?? s.dominant}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </MetricCardWrapper>
  )
}

// Wrapper
interface MetricCardWrapperProps {
  title: string
  children: React.ReactNode
}

export function MetricCardWrapper({ title, children }: MetricCardWrapperProps) {
  return (
    <div className="h-full bg-[var(--surface)] border border-[var(--border)] p-4 md:p-6 flex flex-col">
      <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono">
        {title}
      </span>
      {children}
    </div>
  )
}
