'use client'

import { useState } from 'react'
import { api } from '@/lib/api/client'
import type { AnalysisResult, AnalysisStatus } from '@/lib/api/types'
import { usePolling } from './usePolling'

interface UseAnalysisReturn {
  status: AnalysisStatus | null
  analysis: AnalysisResult | null
  error: string | null
}

export function useAnalysis(id: number, token: string | null): UseAnalysisReturn {
  const [status, setStatus] = useState<AnalysisStatus | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const done = status === 'completed' || status === 'failed'

  usePolling({
    enabled: !!token && !done,
    interval: 3000,
    onTick: async () => {
      if (!token) return
      try {
        const statusData = await api.getStatus(id, token)
        setStatus(statusData.status)

        if (statusData.status === 'completed') {
          const fullAnalysis = await api.getAnalysis(id, token)
          setAnalysis(fullAnalysis)
        } else if (statusData.status === 'failed') {
          setError(statusData.error ?? 'Analysis failed. Please try again.')
        }
      } catch {
        setError('Connection error. Please refresh the page.')
      }
    },
  })

  return { status, analysis, error }
}
