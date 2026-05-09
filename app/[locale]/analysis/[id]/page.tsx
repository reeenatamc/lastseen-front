'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useAnalysis } from '@/hooks/useAnalysis'
import { LoadingChapters } from '@/components/analysis/LoadingChapters'
import { NarrativeCard } from '@/components/analysis/NarrativeCard'
import {
  InitiativeCard,
  ResponseDecayCard,
  SilenceOnsetCard,
  EmotionalDriftCard,
} from '@/components/analysis/MetricCard'
import { ChapterReveal } from '@/components/analysis/ChapterReveal'
import { EmotionalTimeline } from '@/components/visualizations/EmotionalTimeline'
import { SilenceMap } from '@/components/visualizations/SilenceMap'
import { FrequencyChart } from '@/components/visualizations/FrequencyChart'
import { EASE_OUT, fadeIn, fadeUp } from '@/lib/motion'
import { Link } from '@/i18n/navigation'
import { LangToggle } from '@/components/ui/LangToggle'

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

type Chapter = 'loading' | 'narrative' | 'metrics' | 'charts'

export default function AnalysisPage({ params }: PageProps) {
  const { id: idStr } = use(params)
  const id = parseInt(idStr, 10)
  const router = useRouter()
  const t = useTranslations('analysis')

  const [token, setToken] = useState<string | null>(null)
  const [tokenChecked, setTokenChecked] = useState(false)
  const [chapter, setChapter] = useState<Chapter>('loading')
  const [showMetrics, setShowMetrics] = useState(false)
  const [showCharts, setShowCharts] = useState(false)

  // Fetch token from httpOnly cookie via API route
  useEffect(() => {
    fetch('/api/auth/token')
      .then(r => r.json())
      .then(data => {
        if (data.token) {
          setToken(data.token)
        } else {
          router.push('/auth')
        }
        setTokenChecked(true)
      })
      .catch(() => {
        router.push('/auth')
        setTokenChecked(true)
      })
  }, [router])

  const { status, analysis, error } = useAnalysis(tokenChecked && token ? id : NaN, token)

  // When analysis completes, move to narrative chapter
  useEffect(() => {
    if (status === 'completed' && analysis) {
      setChapter('narrative')
    }
    if (status === 'failed') {
      setChapter('narrative') // will show error state
    }
  }, [status, analysis])

  const handleNarrativeComplete = () => {
    setTimeout(() => {
      setShowMetrics(true)
      setChapter('metrics')
    }, 1200)
  }

  // When metrics are shown, charts follow after a short delay
  useEffect(() => {
    if (showMetrics) {
      setTimeout(() => setShowCharts(true), 600)
    }
  }, [showMetrics])

  // Loading / waiting state
  if (!tokenChecked || (chapter === 'loading' && status !== 'failed')) {
    return <LoadingChapters />
  }

  // Hard error
  if (status === 'failed' && !analysis && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-mono text-[var(--destructive)] mb-6">
            {t('failed')}
          </p>
          <Link
            href="/upload"
            className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-2"
          >
            {t('tryAgain')}
          </Link>
        </div>
      </div>
    )
  }

  if (error && !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-mono text-[var(--destructive)] mb-6">{error}</p>
          <Link
            href="/upload"
            className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-2"
          >
            {t('tryAgain')}
          </Link>
        </div>
      </div>
    )
  }

  if (!analysis || !analysis.result) {
    return <LoadingChapters />
  }

  const { temporal, sentiment, narrative } = analysis.result
  const participants = temporal.overview.participants
  const topGap = temporal.conversation_gaps.top_gaps[0]

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="px-4 md:px-8 py-6 flex items-center justify-between"
      >
        <span className="text-xs font-mono text-[var(--text-muted)] tracking-widest uppercase min-w-0 mr-4 truncate">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            LASTSEEN
          </Link>
          {' / '}
          <span>{t('breadcrumb')} #{analysis.id}</span>
        </span>
        <LangToggle />
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 pb-32">
        {/* Chapter 2 — Narrative */}
        <AnimatePresence>
          {(chapter === 'narrative' || chapter === 'metrics' || chapter === 'charts') && (
            <motion.div
              key="narrative"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="mb-16"
            >
              <NarrativeCard
                narrative={narrative}
                onComplete={handleNarrativeComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chapter 3 — Metrics */}
        <AnimatePresence>
          {showMetrics && (
            <motion.div
              key="metrics"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="mb-16"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ ...EASE_OUT, delay: 0 }}
                  className="h-full"
                >
                  <InitiativeCard
                    share={temporal.initiative_balance.share}
                    participants={participants}
                    doubleText={temporal.initiative_balance.double_text}
                  />
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ ...EASE_OUT, delay: 0.12 }}
                >
                  <ResponseDecayCard
                    decayScore={temporal.response_decay.decay_score}
                    trend={temporal.response_decay.trend}
                    turningPoint={temporal.response_decay.turning_point}
                    responseTimes={temporal.response_time.per_person}
                  />
                </motion.div>

                {topGap && (
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ ...EASE_OUT, delay: 0.24 }}
                  >
                    <SilenceOnsetCard days={topGap.days} start={topGap.start} />
                  </motion.div>
                )}

                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ ...EASE_OUT, delay: 0.36 }}
                >
                  <EmotionalDriftCard
                    score={sentiment.emotional_drift?.score ?? 0}
                    direction={sentiment.emotional_drift?.direction ?? ''}
                    hasError={!!sentiment.error}
                    sentimentPerPerson={!sentiment.error ? sentiment.per_person : undefined}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chapter 4 — Visualizations */}
        <AnimatePresence>
          {showCharts && (
            <motion.div
              key="charts"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-16"
            >
              {/* Emotional Timeline */}
              {!sentiment.error && sentiment.evolution?.length > 0 && (
                <ChapterReveal scrollTriggered>
                  <div className="border border-[var(--border)] bg-[var(--surface)] p-4 md:p-8">
                    <EmotionalTimeline
                      evolution={sentiment.evolution}
                      participants={participants}
                    />
                  </div>
                </ChapterReveal>
              )}

              {/* Silence Map */}
              {temporal.activity_patterns.by_month?.length > 0 && (
                <ChapterReveal scrollTriggered>
                  <div className="border border-[var(--border)] bg-[var(--surface)] p-4 md:p-8">
                    <SilenceMap byMonth={temporal.activity_patterns.by_month} />
                  </div>
                </ChapterReveal>
              )}

              {/* Frequency Chart */}
              {temporal.activity_patterns.by_month?.length > 0 && (
                <ChapterReveal scrollTriggered>
                  <div className="border border-[var(--border)] bg-[var(--surface)] p-4 md:p-8">
                    <FrequencyChart byMonth={temporal.activity_patterns.by_month} />
                  </div>
                </ChapterReveal>
              )}

              {/* Footer */}
              <ChapterReveal scrollTriggered>
                <div className="flex flex-col items-center gap-8 pt-8">
                  <p className="text-xs font-mono text-[var(--text-muted)] text-center tracking-wide">
                    {t('footer')}
                  </p>
                  <Link
                    href="/upload"
                    className="inline-flex items-center px-6 py-3 border border-[var(--border)] text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-300"
                  >
                    {t('analyzeAnother')}
                  </Link>
                </div>
              </ChapterReveal>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
