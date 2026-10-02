'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { DropZone } from '@/components/upload/DropZone'
import { PlatformSelector } from '@/components/upload/PlatformSelector'
import { LanguageSelector } from '@/components/upload/LanguageSelector'
import { DateRangeSelector } from '@/components/upload/DateRangeSelector'
import { CreditPacks } from '@/components/analysis/CreditPacks'
import { Button } from '@/components/ui/Button'
import { Link } from '@/i18n/navigation'
import { useCredits } from '@/hooks/useCredits'
import { api, ApiError } from '@/lib/api/client'
import { detectChatDateRangeFromFile } from '@/lib/chat/dateRange'
import { fadeIn, fadeUp, EASE_OUT } from '@/lib/motion'

type Platform = 'whatsapp' | 'telegram' | 'imessage'
type Language = 'es' | 'en'

export default function UploadPage() {
  const router = useRouter()
  const t = useTranslations('upload')
  const tPay = useTranslations('paywall')
  const tLegal = useTranslations('legal')
  const tReports = useTranslations('reports')
  const [file, setFile] = useState<File | null>(null)
  const [platform, setPlatform] = useState<Platform>('whatsapp')
  const [language, setLanguage] = useState<Language>('es')
  const [detectedRange, setDetectedRange] = useState<{ first: string; last: string } | null>(null)
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null)
  const latestFile = useRef<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // null while the session check is pending
  const [token, setToken] = useState<string | null>(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const { balance, packs, reload } = useCredits(token)

  useEffect(() => {
    fetch('/api/auth/token')
      .then(r => r.json())
      .then(data => setToken(data.token ?? null))
      .catch(() => setToken(null))
      .finally(() => setSessionChecked(true))
  }, [])

  const handleFileSelect = async (selected: File) => {
    latestFile.current = selected
    setFile(selected)
    setDateRange(null)
    setDetectedRange(null)
    try {
      const range = await detectChatDateRangeFromFile(selected)
      // A slower read of a previous file must not overwrite the current one
      if (latestFile.current === selected) setDetectedRange(range)
    } catch {
      if (latestFile.current === selected) setDetectedRange(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const tokenRes = await fetch('/api/auth/token')
      const tokenData = await tokenRes.json()

      const authToken = tokenData.token ?? null
      const data = await api.upload(file, authToken, platform, language, dateRange)

      // 1. Authenticated success — analysis_id present. Page polls /status
      //    until the worker finishes (analysis may take a few minutes).
      if (data.analysis_id != null) {
        router.push(`/analysis/${data.analysis_id}`)
        return
      }

      // 2. Guest upload: go to the guest result poller.
      if (data.task_id) {
        router.push(`/upload/result?task=${encodeURIComponent(data.task_id)}`)
        return
      }

      // 3. Neither analysis_id nor task_id — genuine failure.
      setError(t('uploadFailed'))
      setLoading(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(t('rateLimited'))
      } else if (err instanceof ApiError && err.status === 413) {
        setError(t('tooLarge'))
      } else if (err instanceof ApiError && err.status === 401) {
        // Session expired: the client already redirects to /auth
        setError(null)
      } else if (err instanceof ApiError) {
        setError(t('uploadFailed'))
      } else {
        setError(t('connectionError'))
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Breadcrumb */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="px-4 md:px-8 py-6 flex items-center justify-between"
      >
        <span className="text-xs font-mono text-[var(--text-muted)] tracking-widest uppercase">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            LASTSEEN
          </Link>
          {' / '}
          <span>{t('breadcrumb').split(' / ')[1]}</span>
        </span>
        {token && (
          <Link
            href="/analyses"
            className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-2"
          >
            {tReports('link')}
          </Link>
        )}
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-6 py-8 md:py-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ ...EASE_OUT, delay: 0.1 }}
          className="w-full max-w-[520px]"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <DropZone onFileSelect={handleFileSelect} selectedFile={file} error={error} />

            <PlatformSelector selected={platform} onSelect={setPlatform} />

            <LanguageSelector selected={language} onSelect={setLanguage} />

            <DateRangeSelector range={detectedRange} value={dateRange} onChange={setDateRange} />

            <p className="text-xs font-mono text-[var(--text-muted)] leading-relaxed">
              {t('privacy')}
            </p>

            <div className="flex flex-col gap-3" aria-live="polite">
              {sessionChecked && !token && (
                <p className="text-xs font-mono text-[var(--text-muted)]">{tPay('upload.guest')}</p>
              )}
              {token && balance && !balance.is_premium && balance.credits > 0 && (
                <p className="text-xs font-mono text-[var(--text-muted)]">
                  {tPay('upload.withCredits', { count: balance.credits })}
                </p>
              )}
              {token && balance && !balance.is_premium && balance.credits <= 0 && (
                <>
                  <p className="text-xs font-mono text-[var(--text-muted)]">{tPay('upload.noCredits')}</p>
                  {packs && packs.length > 0 && (
                    <CreditPacks packs={packs} token={token} onRefresh={reload} />
                  )}
                </>
              )}
            </div>

            <Button
              type="submit"
              variant={!file || loading ? 'disabled' : 'primary'}
              disabled={!file || loading}
              loading={loading}
              className="w-full"
            >
              {loading ? t('analyzing') : t('cta')}
            </Button>

            <Link
              href="/legal"
              className="self-center text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-2"
            >
              {tLegal('link')}
            </Link>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
