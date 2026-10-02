'use client'

import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import type { ActivityPatterns, TemporalOverview, ClosingPhase, ChargedTone, ConflictData, RecentSentiment } from '@/lib/api/types'
import { formatDate } from '@/lib/utils'
import { fadeUp } from '@/lib/motion'

function formatPeriod(period: string, months: string[]): string {
  const quarterly = period.match(/^(\d{4})-Q(\d)$/)
  if (quarterly) return `Q${quarterly[2]} ${quarterly[1]}`
  const daily = period.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (daily) return `${parseInt(daily[3], 10)} ${months[parseInt(daily[2], 10) - 1]} ${daily[1]}`
  const monthly = period.match(/^(\d{4})-(\d{2})$/)
  if (monthly) return `${months[parseInt(monthly[2], 10) - 1]} ${monthly[1]}`
  return period
}

// "2026-09-14" or full ISO timestamp -> "14 Sep"
function formatShortDay(iso: string, months: string[]): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return iso
  return `${parseInt(m[3], 10)} ${months[parseInt(m[2], 10) - 1]}`
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
type SubCount = { per_person: Record<string, number>; total: number }

interface InitiativeCardProps {
  share: Record<string, number>
  participants: string[]
  abandonedOpen?: SubCount
  doubleText?: SubCount
}

function MiniRow({ label, counts, participants }: { label: string; counts: SubCount; participants: string[] }) {
  return (
    <>
      <div className="h-px bg-[var(--border)]" />
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase">
          {label}
        </span>
        <div className="flex gap-3 flex-wrap">
          {participants.map(p => {
            const count = counts.per_person[p] ?? 0
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
  )
}

export function InitiativeCard({ share, participants, abandonedOpen, doubleText }: InitiativeCardProps) {
  const t = useTranslations('metrics')
  return (
    <MetricCardWrapper title={t('initiativeBalance')}>
      <div className="flex flex-col gap-5 mt-4">
        <div className="flex flex-col gap-3">
          {participants.map(p => (
            <HorizontalBar key={p} value={share[p] ?? 0} label={p} />
          ))}
        </div>

        {abandonedOpen && abandonedOpen.total > 0 && (
          <MiniRow label={t('openedAndLeft')} counts={abandonedOpen} participants={participants} />
        )}

        {doubleText && doubleText.total > 0 && (
          <MiniRow label={t('followedUpUnanswered')} counts={doubleText} participants={participants} />
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
  closingPhase?: ClosingPhase | null
}

function formatSeconds(s: number): string {
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.round(s / 60)}m`
  if (s < 86400) return `${(s / 3600).toFixed(1)}h`
  return `${(s / 86400).toFixed(1)}d`
}

function ResponseTimeBlock({
  responseTimes,
  showLabel = true,
}: {
  responseTimes: Record<string, { mean_seconds: number }>
  showLabel?: boolean
}) {
  const t = useTranslations('metrics')
  return (
    <div className="flex flex-col gap-2">
      {showLabel && (
        <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase">
          {t('avgResponseTime')}
        </span>
      )}
      {Object.entries(responseTimes).map(([p, rt]) => (
        <div key={p} className="flex justify-between items-center">
          <span className="text-xs font-mono text-[var(--text-muted)] truncate max-w-[70%]">{p}</span>
          <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
            {formatSeconds(rt.mean_seconds)}
          </span>
        </div>
      ))}
    </div>
  )
}

// Average response time per person (shown on its own when the decay card is not available)
export function ResponseTimeCard({ responseTimes }: { responseTimes: Record<string, { mean_seconds: number }> }) {
  const t = useTranslations('metrics')
  return (
    <MetricCardWrapper title={t('avgResponseTime')}>
      <div className="mt-4">
        <ResponseTimeBlock responseTimes={responseTimes} showLabel={false} />
      </div>
    </MetricCardWrapper>
  )
}

export function ResponseDecayCard({ decayScore, trend, turningPoint, responseTimes, closingPhase }: ResponseDecayCardProps) {
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
        {closingPhase?.detected && (
          <>
            <div className="h-px bg-[var(--border)]" />
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase">
                {t('closingPhase')}
              </span>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-[var(--text-muted)]">{t('messagesPerDay')}</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
                  {t('ofUsual', { pct: Math.round(closingPhase.volume_ratio * 100) })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-[var(--text-muted)]">{t('longestSilence')}</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
                  {t('before', {
                    days: closingPhase.max_silence_days.toFixed(1),
                    baseline: closingPhase.baseline_max_silence_days.toFixed(1),
                  })}
                </span>
              </div>
            </div>
          </>
        )}
        {responseTimes && Object.keys(responseTimes).length > 0 && (
          <>
            <div className="h-px bg-[var(--border)]" />
            <ResponseTimeBlock responseTimes={responseTimes} />
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
  charged?: ChargedTone
}

interface EmotionalDriftCardProps {
  score: number
  direction: string
  hasError: boolean
  sentimentPerPerson?: Record<string, SentimentPerson>
  recent?: RecentSentiment | null
}

function humanizeDirection(direction: string): string {
  // e.g. "Alice_positive_Bob_negative" → "Alice positive · Bob negative"
  return direction
    .replace(/_positive/g, ' positive')
    .replace(/_negative/g, ' negative')
    .replace(/_neutral/g, ' neutral')
    .replace(/_/g, ' · ')
}

export function EmotionalDriftCard({ score, direction, hasError, sentimentPerPerson, recent }: EmotionalDriftCardProps) {
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
                {Object.values(sentimentPerPerson).some(s => s.charged) && (
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">{t('toneChargedNote')}</span>
                )}
                {Object.entries(sentimentPerPerson).map(([p, s]) => (
                  <div key={p} className="flex justify-between items-center">
                    <span className="text-xs font-mono text-[var(--text-muted)] truncate max-w-[70%]">{p}</span>
                    <span
                      className="text-xs font-mono"
                      style={{ color: s.dominant === 'positive' ? 'var(--warm)' : 'var(--text-muted)' }}
                    >
                      {s.charged && s.charged.positive != null
                        ? t('toneSplit', {
                            pos: Math.round(s.charged.positive * 100),
                            neg: Math.round((s.charged.negative ?? 1 - s.charged.positive) * 100),
                          })
                        : TONE_LABEL[s.dominant] ?? s.dominant}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
          {(recent?.shift === 'more_negative' || recent?.shift === 'more_positive') && (
            <span
              className="text-xs font-mono"
              style={{ color: recent.shift === 'more_negative' ? 'var(--warm)' : 'var(--text-muted)' }}
            >
              {recent.shift === 'more_negative'
                ? t('toneMoreNegative', { days: recent.window_days })
                : t('toneMorePositive', { days: recent.window_days })}
            </span>
          )}
        </div>
      )}
    </MetricCardWrapper>
  )
}

// Conflict card
export function ConflictCard({ conflict }: { conflict?: ConflictData | { error: string } | null }) {
  const t = useTranslations('metrics')
  const months = useTranslations('months')
  const monthNames = Array.from({ length: 12 }, (_, i) => months(`${i}` as any))

  if (!conflict || 'error' in conflict && conflict.error) return null
  const data = conflict as ConflictData
  const episodes = [...(data.episodes ?? [])].sort((a, b) => a.start.localeCompare(b.start))
  const ratio = data.recent?.ratio

  return (
    <MetricCardWrapper title={t('conflictEpisodes')}>
      <div className="flex flex-col gap-3 mt-4">
        <span
          className="text-3xl"
          style={{
            fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif',
            color: 'var(--warm)',
          }}
        >
          {episodes.length}
          <span className="text-base ml-1 font-mono" style={{ color: 'var(--text-muted)' }}>
            {t('episodes', { count: episodes.length })}
          </span>
        </span>
        {data.recent && ratio != null && ratio >= 1.5 && (
          <span className="text-xs font-mono" style={{ color: 'var(--warm)' }}>
            {t('conflictRecent', { weeks: data.recent.window_weeks, ratio: ratio.toFixed(1) })}
          </span>
        )}
        <div className="h-px bg-[var(--border)]" />
        {episodes.length === 0 ? (
          <span className="text-xs font-mono text-[var(--text-muted)]">{t('noConflict')}</span>
        ) : (
          <div className="flex flex-col gap-2">
            {episodes.map(ep => {
              const startDay = ep.start.slice(0, 10)
              const endDay = ep.end.slice(0, 10)
              const date =
                endDay > startDay
                  ? `${formatShortDay(startDay, monthNames)} - ${formatShortDay(endDay, monthNames)}`
                  : formatShortDay(startDay, monthNames)
              const extras = [
                t('mentions', { count: ep.mentions }),
                ep.blocked ? t('blocked') : null,
                ep.missed_calls >= 8 ? t('missedCalls', { count: ep.missed_calls }) : null,
              ].filter(Boolean)
              return (
                <div key={`${ep.start}-${ep.end}`} className="flex justify-between items-center gap-3">
                  <span
                    className="text-xs font-mono shrink-0"
                    style={{ color: ep.severity === 'high' ? 'var(--warm)' : 'var(--text-muted)' }}
                  >
                    {date}
                  </span>
                  <span className="text-xs font-mono text-right" style={{ color: 'var(--text-primary)' }}>
                    {extras.join(' · ')}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </MetricCardWrapper>
  )
}

// Delayed Replies card
interface DelayedRepliesCardProps {
  perPerson: Record<string, number>
  total: number
  participants: string[]
}

export function DelayedRepliesCard({ perPerson, total, participants }: DelayedRepliesCardProps) {
  const t = useTranslations('metrics')

  return (
    <MetricCardWrapper title={t('delayedReplies')}>
      <div className="flex flex-col gap-4 mt-4">
        {total === 0 ? (
          <span className="text-xs font-mono text-[var(--text-muted)]">{t('noDelays')}</span>
        ) : (
          <>
            {participants.map(p => {
              const count = perPerson[p] ?? 0
              return (
                <div key={p} className="flex flex-col gap-1.5">
                  <span className="text-xs font-mono text-[var(--text-muted)] truncate">{p}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 bg-[var(--border)] overflow-hidden">
                      <div
                        className="h-full transition-all duration-700"
                        style={{
                          width: `${total > 0 ? (count / total) * 100 : 0}%`,
                          backgroundColor: count > total * 0.6 ? 'var(--warm)' : 'var(--text-primary)',
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-[var(--text-muted)] w-6 text-right shrink-0">
                      {count}×
                    </span>
                  </div>
                </div>
              )
            })}
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {t('delayThreshold')}
            </span>
          </>
        )}
      </div>
    </MetricCardWrapper>
  )
}


// Overview card: totals, period, share per person, busiest hour and weekday
function peakKey(counts: Record<string, number> | undefined): string | null {
  if (!counts) return null
  let best: string | null = null
  for (const [k, v] of Object.entries(counts)) {
    if (v > 0 && (best === null || v > counts[best])) best = k
  }
  return best
}

export function OverviewCard({ overview, activity }: { overview: TemporalOverview; activity?: ActivityPatterns }) {
  const t = useTranslations('metrics')
  const locale = useLocale()
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })

  const hour = peakKey(activity?.by_hour)
  // Weekday keys follow the backend: 0 = Monday. 2024-01-01 was a Monday.
  const weekday = peakKey(activity?.by_weekday)
  const weekdayName =
    weekday !== null
      ? new Date(2024, 0, 1 + Number(weekday)).toLocaleDateString(locale, { weekday: 'long' })
      : null

  const rows: Array<[string, string]> = []
  if (hour !== null) rows.push([t('overview.busiestHour'), `${hour.padStart(2, '0')}:00`])
  if (weekdayName) rows.push([t('overview.busiestDay'), weekdayName])

  return (
    <MetricCardWrapper title={t('overview.title')}>
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono text-[var(--text-muted)]">{t('overview.totalMessages')}</span>
          <span className="text-xs font-mono" style={{ color: 'var(--warm)' }}>
            {new Intl.NumberFormat(locale).format(overview.total_messages)}
          </span>
        </div>
        {overview.date_range && (
          <div className="flex justify-between items-center gap-4">
            <span className="text-xs font-mono text-[var(--text-muted)]">{t('overview.period')}</span>
            <span className="text-xs font-mono text-right" style={{ color: 'var(--text-primary)' }}>
              {t('overview.range', {
                start: fmtDate(overview.date_range.start),
                end: fmtDate(overview.date_range.end),
              })}
            </span>
          </div>
        )}
        <div className="h-px bg-[var(--border)]" />
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase">
            {t('overview.perPerson')}
          </span>
          {overview.participants.map(p => {
            const count = overview.messages_per_person[p] ?? 0
            const pct = overview.total_messages > 0 ? Math.round((count / overview.total_messages) * 100) : 0
            return (
              <div key={p} className="flex justify-between items-center">
                <span className="text-xs font-mono text-[var(--text-muted)] truncate max-w-[60%]">{p}</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
                  {new Intl.NumberFormat(locale).format(count)} · {pct} %
                </span>
              </div>
            )
          })}
        </div>
        {rows.length > 0 && (
          <>
            <div className="h-px bg-[var(--border)]" />
            <div className="flex flex-col gap-2">
              {rows.map(([label, value]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs font-mono text-[var(--text-muted)]">{label}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
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
