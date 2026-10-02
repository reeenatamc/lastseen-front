'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { LoadingChapters } from '@/components/analysis/LoadingChapters'
import {
  OverviewCard,
  InitiativeCard,
  ResponseDecayCard,
  ResponseTimeCard,
  SilenceOnsetCard,
  EmotionalDriftCard,
  ConflictCard,
} from '@/components/analysis/MetricCard'
import { NarrativeCard } from '@/components/analysis/NarrativeCard'
import { LockedReport } from '@/components/analysis/LockedReport'
import { ChapterReveal } from '@/components/analysis/ChapterReveal'
import { EmotionalTimeline } from '@/components/visualizations/EmotionalTimeline'
import { SilenceMap } from '@/components/visualizations/SilenceMap'
import { FrequencyChart } from '@/components/visualizations/FrequencyChart'
import { fadeIn, fadeUp, EASE_OUT } from '@/lib/motion'
import { analysisErrorKey, isUuid } from '@/lib/analysis-errors'
import type { AccessInfo, Narrative, ConflictData } from '@/lib/api/types'

const POLL_INTERVAL = 3000
const TIMEOUT_MS = 15 * 60 * 1000

// Shape returned by GET /api/v1/upload/status/{task_id} when succeeded
interface TaskResult {
  platform: string
  total_messages: number
  participants: string[]
  analysis: {
    temporal: Record<string, unknown>
    sentiment: Record<string, unknown>
    narrative?: Narrative
    conflict?: ConflictData | { error: string }
  }
  // Absent on results saved before the paywall: treated as full
  access?: AccessInfo | null
}

type PageState = 'loading' | 'completed' | 'failed'

export default function GuestResultPage() {
  const searchParams = useSearchParams()
  const taskId = searchParams.get('task')
  const t = useTranslations('analysis')
  const tGuest = useTranslations('guest')

  const [pageState, setPageState] = useState<PageState>('loading')
  const [result, setResult] = useState<TaskResult | null>(null)
  const [chapter, setChapter] = useState<'loading' | 'narrative' | 'metrics'>('loading')
  const [showMetrics, setShowMetrics] = useState(false)
  const [showCharts, setShowCharts] = useState(false)
  // Error code, translated at render time through analysisErrorKey
  const [error, setError] = useState<string | null>(null)

  // Real session check: a signed-in user sees credit actions instead of "create account"
  const [token, setToken] = useState<string | null>(null)
  const [tokenChecked, setTokenChecked] = useState(false)

  useEffect(() => {
    fetch('/api/auth/token')
      .then(r => r.json())
      .then(data => setToken(data.token ?? null))
      .catch(() => setToken(null))
      .finally(() => setTokenChecked(true))
  }, [])

  const startedAt = useRef(Date.now())

  useEffect(() => {
    if (!isUuid(taskId)) {
      setError('invalid_link')
      setPageState('failed')
      return
    }

    const poll = async () => {
      if (Date.now() - startedAt.current > TIMEOUT_MS) {
        setError('timeout')
        setPageState('failed')
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/upload/status/${encodeURIComponent(taskId)}`)
        const data = await res.json()

        if (data.state === 'SUCCESS' && data.result) {
          setResult(data.result)
          setPageState('completed')
          // A preview carries no narrative: show the metrics right away
          if (data.result.access?.level === 'preview' || !data.result.analysis?.narrative) {
            setShowMetrics(true)
            setChapter('metrics')
          } else {
            setChapter('narrative')
          }
        } else if (data.state === 'FAILURE') {
          setError('internal_error')
          setPageState('failed')
        }
        // PENDING / STARTED → keep polling
      } catch {
        setError('connection')
        setPageState('failed')
      }
    }

    poll()
    const interval = setInterval(() => {
      if (pageState !== 'loading') return
      poll()
    }, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [taskId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (showMetrics) {
      setTimeout(() => setShowCharts(true), 600)
    }
  }, [showMetrics])

  const handleNarrativeComplete = () => {
    setTimeout(() => {
      setShowMetrics(true)
      setChapter('metrics')
    }, 1200)
  }

  if (pageState === 'loading') return <LoadingChapters />

  if (pageState === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-sm font-mono text-[var(--destructive)] mb-2">{t(`errorCodes.${analysisErrorKey(error)}`)}</p>
          <p className="text-xs font-mono text-[var(--text-muted)] mb-8">{t('errorHint')}</p>
          <Link href="/upload" className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-2">
            {t('tryAgain')}
          </Link>
        </div>
      </div>
    )
  }

  if (!result) return <LoadingChapters />

  const temporal = result.analysis.temporal as any
  const sentiment = result.analysis.sentiment as any
  const narrative = result.analysis.narrative
  const participants = result.participants
  const topGap = temporal?.conversation_gaps?.top_gaps?.[0]
  const preview = result.access?.level === 'preview' ? result.access : null

  return (
    <div className="min-h-screen">
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="px-4 md:px-8 py-6">
        <span className="text-xs font-mono text-[var(--text-muted)] tracking-widest uppercase">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">LASTSEEN</Link>
          {' / '}
          <span>{t('breadcrumb')}</span>
        </span>
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 pb-32">

        {/* Narrative */}
        <AnimatePresence>
          {narrative && !preview && (chapter === 'narrative' || chapter === 'metrics') && (
            <motion.div key="narrative" variants={fadeIn} initial="hidden" animate="visible" className="mb-16">
              <NarrativeCard narrative={narrative} onComplete={handleNarrativeComplete} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metrics */}
        <AnimatePresence>
          {showMetrics && (
            <motion.div key="metrics" variants={fadeIn} initial="hidden" animate="visible" className="mb-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                {[
                  temporal?.overview ? <OverviewCard key="overview" overview={temporal.overview} activity={temporal.activity_patterns} /> : null,
                  temporal?.initiative_balance ? <InitiativeCard key="init" share={temporal.initiative_balance.share ?? {}} participants={participants} doubleText={temporal.initiative_balance.double_text} /> : null,
                  temporal?.response_decay
                    ? <ResponseDecayCard key="decay" decayScore={temporal.response_decay.decay_score ?? 0} trend={temporal.response_decay.trend ?? 'stable'} turningPoint={temporal.response_decay.turning_point} responseTimes={temporal.response_time?.per_person} closingPhase={temporal.response_decay.closing_phase} />
                    : temporal?.response_time?.per_person
                      ? <ResponseTimeCard key="rtime" responseTimes={temporal.response_time.per_person} />
                      : null,
                  topGap ? <SilenceOnsetCard key="silence" days={topGap.days} start={topGap.start} /> : null,
                  sentiment ? <EmotionalDriftCard key="drift" score={sentiment.emotional_drift?.score ?? 0} direction={sentiment.emotional_drift?.direction ?? ''} hasError={!!sentiment.error} sentimentPerPerson={!sentiment.error ? sentiment.per_person : undefined} recent={!sentiment.error ? sentiment.recent : undefined} /> : null,
                ].map((card, i) => card && (
                  <motion.div key={i} variants={fadeUp} initial="hidden" animate="visible" transition={{ ...EASE_OUT, delay: i * 0.12 }} className="h-full">
                    {card}
                  </motion.div>
                ))}
                {result.analysis.conflict && !('error' in result.analysis.conflict) && (
                  <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ ...EASE_OUT, delay: 0.6 }} className="h-full sm:col-span-2">
                    <ConflictCard conflict={result.analysis.conflict} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Charts */}
        <AnimatePresence>
          {showCharts && (
            <motion.div key="charts" variants={fadeIn} initial="hidden" animate="visible" className="flex flex-col gap-16">
              {sentiment && !sentiment.error && sentiment.evolution?.length > 0 && (
                <ChapterReveal scrollTriggered>
                  <div className="border border-[var(--border)] bg-[var(--surface)] p-4 md:p-8">
                    <EmotionalTimeline evolution={sentiment.evolution} participants={participants} />
                  </div>
                </ChapterReveal>
              )}
              {temporal?.activity_patterns?.by_month?.length > 0 && (
                <ChapterReveal scrollTriggered>
                  <div className="border border-[var(--border)] bg-[var(--surface)] p-4 md:p-8">
                    <SilenceMap byMonth={temporal.activity_patterns.by_month} />
                  </div>
                </ChapterReveal>
              )}
              {temporal?.activity_patterns?.by_month?.length > 0 && (
                <ChapterReveal scrollTriggered>
                  <div className="border border-[var(--border)] bg-[var(--surface)] p-4 md:p-8">
                    <FrequencyChart byMonth={temporal.activity_patterns.by_month} />
                  </div>
                </ChapterReveal>
              )}

              {/* Paywall: unlock flow replaces the generic guest conversion CTA */}
              {preview ? (
                tokenChecked && (
                <ChapterReveal scrollTriggered>
                  <LockedReport access={preview} token={token} />
                </ChapterReveal>
                )
              ) : (
                <ChapterReveal scrollTriggered>
                  <div className="flex flex-col items-center gap-6 pt-8 text-center">
                    <p className="text-xl md:text-2xl text-[var(--text-muted)]"
                      style={{ fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif', fontStyle: 'italic' }}>
                      {tGuest('title')}
                    </p>
                    <p className="text-xs font-mono text-[var(--text-muted)] max-w-xs leading-relaxed">
                      {tGuest('subtitle')}
                    </p>
                    <Link href="/auth"
                      className="inline-flex items-center px-8 py-4 bg-[var(--text-primary)] text-[var(--background)] text-xs font-mono tracking-widest uppercase hover:bg-white transition-colors duration-300">
                      {tGuest('cta')}
                    </Link>
                    <p className="text-[11px] font-mono text-[var(--text-muted)]">{tGuest('free')}</p>
                  </div>
                </ChapterReveal>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {showCharts && (
          <p className="mt-16 text-xs font-mono text-[var(--text-muted)] text-center tracking-wide">
            {t('footerGuest')}
          </p>
        )}
      </div>
    </div>
  )
}
