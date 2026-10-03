'use client'

import { use, useEffect, useState } from 'react'
import { useRouter, Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useAnalysis } from '@/hooks/useAnalysis'
import { LoadingChapters } from '@/components/analysis/LoadingChapters'
import { ReportStory } from '@/components/analysis/ReportStory'
import { analysisErrorKey } from '@/lib/analysis-errors'

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default function AnalysisPage({ params }: PageProps) {
  const { id: idStr } = use(params)
  const id = /^\d+$/.test(idStr) ? parseInt(idStr, 10) : NaN
  const router = useRouter()
  const t = useTranslations('analysis')

  const [token, setToken] = useState<string | null>(null)
  const [tokenChecked, setTokenChecked] = useState(false)

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

  const invalidId = tokenChecked && !!token && isNaN(id)
  const hasError = invalidId || status === 'failed' || (!!error && !analysis)

  // Show loading while waiting — but not if there's already an error
  if (!tokenChecked || (!hasError && (status !== 'completed' || !analysis))) {
    return <LoadingChapters />
  }

  // Unified error screen
  if (hasError) {
    const message = t(`errorCodes.${invalidId ? 'invalid_link' : analysisErrorKey(error ?? 'internal_error')}`)
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-sm font-mono text-[var(--destructive)] mb-2 leading-relaxed">
            {message}
          </p>
          <p className="text-xs font-mono text-[var(--text-muted)] mb-8">
            {t('errorHint')}
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

  if (!analysis || !analysis.result) {
    return <LoadingChapters />
  }

  return <ReportStory result={analysis.result} access={analysis.access} token={token} analysisId={analysis.id} />
}
