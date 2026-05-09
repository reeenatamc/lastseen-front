'use client'

import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api/client'
import type { AnalysisResult, AnalysisStatus } from '@/lib/api/types'
import { usePolling } from './usePolling'

const TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes — if still pending, surface an error

interface UseAnalysisReturn {
  status: AnalysisStatus | null
  analysis: AnalysisResult | null
  error: string | null
}

export function useAnalysis(id: number, token: string | null): UseAnalysisReturn {
  const [status, setStatus]   = useState<AnalysisStatus | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const startedAt = useRef<number>(Date.now())
  const done = status === 'completed' || status === 'failed' || !!error

  usePolling({
    enabled: !!token && !isNaN(id) && !done,
    interval: 3000,
    onTick: async () => {
      if (!token) return

      // Timeout guard — don't leave the user stuck forever
      if (Date.now() - startedAt.current > TIMEOUT_MS) {
        setError('The analysis is taking longer than expected. Please try again.')
        return
      }

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

  // Reset timer if id changes (new analysis)
  useEffect(() => {
    startedAt.current = Date.now()
    setStatus(null)
    setAnalysis(null)
    setError(null)
  }, [id])

  return { status, analysis, error }
}
