'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { LoadingChapters } from '@/components/analysis/LoadingChapters'
import { ReportStory } from '@/components/analysis/ReportStory'
import { analysisErrorKey, isUuid } from '@/lib/analysis-errors'
import type { AccessInfo, AnalysisResult, Narrative, ConflictData } from '@/lib/api/types'

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

  const [pageState, setPageState] = useState<PageState>('loading')
  const [result, setResult] = useState<TaskResult | null>(null)
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

  if (pageState === 'loading' || (pageState === 'completed' && !tokenChecked)) return <LoadingChapters />

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

  const report = {
    temporal: result.analysis.temporal,
    sentiment: result.analysis.sentiment,
    narrative: result.analysis.narrative,
    conflict: result.analysis.conflict,
  } as unknown as NonNullable<AnalysisResult['result']>

  return <ReportStory result={report} access={result.access} token={token} />
}
