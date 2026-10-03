import type { ReactNode } from 'react'
import type { useTranslations } from 'next-intl'
import type { AnalysisResult } from '@/lib/api/types'
import { FrequencyChart } from '@/components/visualizations/FrequencyChart'
import { SilenceMap } from '@/components/visualizations/SilenceMap'
import { formatDay, formatPeriod, peakKey, splitDuration, weekdayName } from '@/lib/format'
import { Datum, Detail, Phrase, SERIF, ShareBar, Stack, useShort } from './primitives'
import type { StoryScreen } from './StoryShell'

type Translator = ReturnType<typeof useTranslations>
export type ReportData = NonNullable<AnalysisResult['result']>

export interface ScreenContext {
  data: ReportData
  locale: string
  t: Translator
  tm: Translator
  tn: Translator
}

const firstName = (name: string) => name.split(' ')[0]

/** Joins fragments as sentences: "Ana: 2,4 h. Luis: 3,4 h." */
const sentences = (items: string[]) => (items.length ? `${items.join('. ')}.` : '')

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

function nf(locale: string, digits = 1) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits })
}

function topEntry(record: Record<string, number>): [string, number] | null {
  let best: [string, number] | null = null
  for (const entry of Object.entries(record)) {
    if (best === null || entry[1] > best[1]) best = entry
  }
  return best
}

function duration(ctx: ScreenContext, seconds: number): { text: string; unit: string } {
  const { value, unit } = splitDuration(seconds)
  const digits = unit === 'h' || unit === 'd' ? 1 : 0
  return { text: nf(ctx.locale, digits).format(value), unit: ctx.t(`unit.${unit}`) }
}

function counts(record: Record<string, number>, participants: string[]): string {
  return participants
    .filter(p => (record[p] ?? 0) > 0)
    .map(p => `${firstName(p)} ${record[p]}×`)
    .join(', ')
}

function summary(ctx: ScreenContext): StoryScreen {
  const { data, locale, t, tm } = ctx
  const { overview } = data.temporal
  const activity = data.temporal.activity_patterns
  const hour = peakKey(activity?.by_hour)
  const weekday = peakKey(activity?.by_weekday)
  const range = overview.date_range
  const share = sentences(overview.participants
    .map(p => {
      const pct = overview.total_messages > 0 ? Math.round(((overview.messages_per_person[p] ?? 0) / overview.total_messages) * 100) : 0
      return `${firstName(p)}: ${t('percent', { value: pct })}`
    }))
  const busiest = [
    hour !== null ? t('summary.hour', { value: `${hour.padStart(2, '0')}:00` }) : null,
    weekday !== null ? t('summary.day', { value: weekdayName(Number(weekday), locale) }) : null,
  ].filter(Boolean)

  return {
    id: 'summary',
    node: (
      <Stack>
        <Datum>{nf(locale, 0).format(overview.total_messages)}</Datum>
        <Phrase>{t('summary.phrase', { count: overview.total_messages, days: range?.total_days ?? 0 })}</Phrase>
        <Detail
          lines={[
            range && tm('overview.range', { start: formatDay(range.start, locale), end: formatDay(range.end, locale) }),
            share,
            sentences(busiest as string[]),
          ]}
        />
      </Stack>
    ),
  }
}

function initiative(ctx: ScreenContext): StoryScreen | null {
  const { data, locale, t } = ctx
  const ib = data.temporal.initiative_balance
  if (!ib) return null
  const participants = data.temporal.overview.participants
  const top = topEntry(ib.share)
  if (!top) return null
  const low = ib.confidence?.level === 'low'
  const shares = sentences(participants.map(p => `${firstName(p)}: ${t('percent', { value: Math.round((ib.share[p] ?? 0) * 100) })}`))
  const left = ib.abandoned_open?.total > 0 ? t('initiative.left', { list: counts(ib.abandoned_open.per_person, participants) }) : null
  const followed = ib.double_text?.total > 0 ? t('initiative.followed', { list: counts(ib.double_text.per_person, participants) }) : null

  return {
    id: 'initiative',
    node: (
      <Stack>
        {low ? (
          <>
            <Datum>{nf(locale, 0).format(ib.total_conversations)}</Datum>
            <Phrase>{t('initiative.low', { count: ib.total_conversations })}</Phrase>
          </>
        ) : (
          <>
            <Datum>{t('percent', { value: Math.round(top[1] * 100) })}</Datum>
            <ShareBar value={top[1]} warm />
            <Phrase>{t('initiative.phrase', { name: firstName(top[0]) })}</Phrase>
          </>
        )}
        <Detail lines={[shares, left, followed]} />
      </Stack>
    ),
  }
}

function rhythm(ctx: ScreenContext): StoryScreen | null {
  const { data, locale, t, tm } = ctx
  const perPerson = data.temporal.response_time?.per_person
  if (!perPerson) return null
  const entries = Object.entries(perPerson)
  if (entries.length === 0) return null
  const slowest = entries.reduce((a, b) => (b[1].mean_seconds > a[1].mean_seconds ? b : a))
  const main = duration(ctx, slowest[1].mean_seconds)
  const list = sentences(
    entries.map(([p, rt]) => {
      const d = duration(ctx, rt.mean_seconds)
      return `${firstName(p)}: ${d.text} ${d.unit}`
    }),
  )
  const decay = data.temporal.response_decay
  const trendLabels: Record<string, string> = {
    deteriorating: tm('worseningOverTime'),
    stable: tm('holdingSteady'),
    improving: tm('recovering'),
  }
  const delayed = data.temporal.delayed_replies
  const delayedLine =
    delayed && delayed.total > 0
      ? t('rhythm.delayed', {
          hours: nf(locale, 0).format(delayed.threshold_hours ?? 3),
          list: counts(delayed.per_person, data.temporal.overview.participants),
        })
      : null

  return {
    id: 'rhythm',
    node: (
      <Stack>
        <Datum unit={main.unit}>{main.text}</Datum>
        <Phrase>{t('rhythm.phrase', { name: firstName(slowest[0]) })}</Phrase>
        <Detail
          lines={[
            entries.length > 1 && list,
            decay && t('rhythm.trend', { value: trendLabels[decay.trend] ?? decay.trend }),
            delayedLine,
          ]}
        />
      </Stack>
    ),
  }
}

function turning(ctx: ScreenContext): StoryScreen | null {
  const { data, locale, t } = ctx
  const byResponse = data.temporal.response_decay?.turning_point ?? null
  const byTone = data.sentiment && !data.sentiment.error ? data.sentiment.emotional_drift?.turning_point ?? null : null
  const period = byResponse ?? byTone
  if (!period) return null
  return {
    id: 'turning',
    node: (
      <Stack>
        <Datum>{formatPeriod(period, locale)}</Datum>
        <Phrase>{t('turning.phrase')}</Phrase>
        <Detail lines={[byResponse ? t('turning.byResponse') : t('turning.byTone')]} />
      </Stack>
    ),
  }
}

function closing(ctx: ScreenContext): StoryScreen | null {
  const { data, locale, t } = ctx
  const phase = data.temporal.response_decay?.closing_phase
  if (!phase?.detected) return null
  return {
    id: 'closing',
    node: (
      <Stack>
        <Datum>{t('percent', { value: Math.round(phase.volume_ratio * 100) })}</Datum>
        <Phrase>{t('closing.phrase', { date: formatDay(phase.start, locale) })}</Phrase>
        <Detail
          lines={[
            t('closing.silence', {
              days: nf(locale).format(phase.max_silence_days),
              baseline: nf(locale).format(phase.baseline_max_silence_days),
            }),
          ]}
        />
      </Stack>
    ),
  }
}

function tone(ctx: ScreenContext): StoryScreen | null {
  const { data, t, tm } = ctx
  const s = data.sentiment
  if (!s || s.error) return null
  const aligned = (s.emotional_drift?.score ?? 0) < 0.15
  const labels: Record<string, string> = { positive: tm('warm'), neutral: tm('neutral'), negative: tm('distant') }
  const people = Object.entries(s.per_person ?? {})
  const shift = s.recent?.shift
  const shiftLine =
    shift === 'more_negative'
      ? tm('toneMoreNegative', { days: s.recent!.window_days })
      : shift === 'more_positive'
        ? tm('toneMorePositive', { days: s.recent!.window_days })
        : null

  return {
    id: 'tone',
    node: (
      <Stack>
        <Phrase>{t('tone.phrase')}</Phrase>
        <div className="flex flex-col gap-3">
          {people.map(([name, p]) => {
            const charged = p.charged && p.charged.positive != null ? p.charged : null
            const pos = charged ? Math.round(charged.positive! * 100) : 0
            const neg = charged ? Math.round((charged.negative ?? 1 - charged.positive!) * 100) : 0
            return (
              <div
                key={name}
                className="story-person flex flex-col md:flex-row md:justify-between md:items-baseline gap-x-6 text-[var(--text-primary)]"
                style={{ fontFamily: SERIF }}
              >
                <span className="min-w-0 [overflow-wrap:anywhere]">{firstName(name)}</span>
                {charged ? (
                  <span>
                    <span style={{ color: 'var(--warm)' }}>
                      {t('percent', { value: pos })} {tm('warm')}
                    </span>
                    , {t('percent', { value: neg })} {t('tone.tense')}
                  </span>
                ) : (
                  <span>{labels[p.dominant] ?? p.dominant}</span>
                )}
              </div>
            )
          })}
        </div>
        <Detail lines={[shiftLine && `${capitalize(shiftLine)}.`, aligned ? t('tone.aligned') : t('tone.apart')]} />
      </Stack>
    ),
  }
}

function conflict(ctx: ScreenContext): StoryScreen | null {
  const { data, locale, t, tm } = ctx
  const c = data.conflict
  if (!c || 'error' in c) return null
  const episodes = [...(c.episodes ?? [])].sort((a, b) => a.start.localeCompare(b.start))
  const ratio = c.recent?.ratio
  const lines: string[] = []
  if (c.recent && ratio != null && ratio >= 1.5) {
    lines.push(tm('conflictRecent', { weeks: c.recent.window_weeks, ratio: nf(locale).format(ratio) }))
  }
  const rows = episodes.map(ep => {
    const startDay = ep.start.slice(0, 10)
    const endDay = ep.end.slice(0, 10)
    const date =
      endDay > startDay
        ? t('dateRange', { start: formatDay(startDay, locale, false), end: formatDay(endDay, locale, false) })
        : formatDay(startDay, locale, false)
    const extras = [
      tm('mentions', { count: ep.mentions }),
      ep.blocked ? tm('blocked') : null,
      ep.missed_calls >= 8 ? tm('missedCalls', { count: ep.missed_calls }) : null,
    ].filter(Boolean)
    return `${date}: ${extras.join(' · ')}`
  })
  const room = 3 - lines.length
  if (rows.length > room) {
    lines.push(...rows.slice(0, room - 1), t('conflict.more', { count: rows.length - (room - 1) }))
  } else {
    lines.push(...rows)
  }

  return {
    id: 'conflict',
    node: (
      <Stack>
        <Datum>{episodes.length}</Datum>
        <Phrase>{episodes.length === 0 ? t('conflict.none') : t('conflict.phrase', { count: episodes.length })}</Phrase>
        <Detail lines={lines} />
      </Stack>
    ),
  }
}

function ActivityCharts({ months }: { months: NonNullable<ReportData['temporal']['activity_patterns']['by_month']> }) {
  const short = useShort()
  return (
    <>
      <FrequencyChart byMonth={months} height={short ? 130 : 200} />
      <SilenceMap byMonth={months} />
    </>
  )
}

function activity(ctx: ScreenContext): StoryScreen | null {
  const { data, locale, t } = ctx
  const ap = data.temporal.activity_patterns
  if (!ap) return null
  const hour = peakKey(ap.by_hour)
  const weekday = peakKey(ap.by_weekday)
  const gap = data.temporal.conversation_gaps?.top_gaps?.[0]
  const gapLine = gap
    ? gap.days < 1
      ? t('activity.silenceHours', { count: Math.max(1, Math.round(gap.days * 24)), date: formatDay(gap.start, locale) })
      : t('activity.silenceDays', { count: Math.round(gap.days), date: formatDay(gap.start, locale) })
    : null
  const days = data.temporal.overview.date_range?.total_days ?? 0
  const months = ap.by_month ?? []

  return {
    id: 'activity',
    node: (
      <Stack>
        {hour !== null ? (
          <>
            <Datum>{`${hour.padStart(2, '0')}:00`}</Datum>
            <Phrase>{t('activity.phrase')}</Phrase>
          </>
        ) : (
          <>
            <Datum>{nf(locale, 0).format(days)}</Datum>
            <Phrase>{t('activity.days')}</Phrase>
          </>
        )}
        {months.length > 0 && <ActivityCharts months={months} />}
        <Detail lines={[weekday !== null && `${t('summary.day', { value: weekdayName(Number(weekday), locale) })}.`, gapLine && `${gapLine}.`]} />
      </Stack>
    ),
  }
}

const NARRATIVE_KEYS = [
  ['label0', 'resumen'],
  ['label1', 'dinamica'],
  ['label2', 'punto_de_quiebre'],
  ['label3', 'estado_actual'],
  ['label4', 'reflexion'],
] as const

function narrativeScreens(ctx: ScreenContext): StoryScreen[] {
  const n = ctx.data.narrative
  if (!n || n.error) return []
  return NARRATIVE_KEYS.flatMap(([label, field]) => {
    const text = n[field]
    if (!text) return []
    return [
      {
        id: `narrative-${field}`,
        node: (
          <Stack>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
              {capitalize(ctx.tn(label))}
            </p>
            <p className="story-narrative text-[var(--text-primary)]" style={{ fontFamily: SERIF }}>
              {text}
            </p>
          </Stack>
        ),
      },
    ]
  })
}

/** Screens of a full report, in order. Screens without data are left out. */
export function buildReportScreens(ctx: ScreenContext, tail: ReactNode, tailId: string): StoryScreen[] {
  const list: Array<StoryScreen | null> = [
    summary(ctx),
    initiative(ctx),
    rhythm(ctx),
    turning(ctx),
    closing(ctx),
    tone(ctx),
    conflict(ctx),
    activity(ctx),
  ]
  return [
    ...list.filter((s): s is StoryScreen => s !== null),
    ...narrativeScreens(ctx),
    { id: tailId, node: tail },
  ]
}
