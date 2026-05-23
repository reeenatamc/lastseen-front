'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { DropZone } from '@/components/upload/DropZone'
import { PlatformSelector } from '@/components/upload/PlatformSelector'
import { LanguageSelector } from '@/components/upload/LanguageSelector'
import { GuestConversionScreen } from '@/components/upload/GuestConversionScreen'
import { Button } from '@/components/ui/Button'
import { Link } from '@/i18n/navigation'
import { api, ApiError } from '@/lib/api/client'
import { fadeIn, fadeUp, EASE_OUT } from '@/lib/motion'

type Platform = 'whatsapp' | 'telegram' | 'imessage'
type Language = 'es' | 'en'

export default function UploadPage() {
  const router = useRouter()
  const t = useTranslations('upload')
  const [file, setFile] = useState<File | null>(null)
  const [platform, setPlatform] = useState<Platform>('whatsapp')
  const [language, setLanguage] = useState<Language>('es')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Guest usage state — null = checking, true = already used, false = first time
  const [guestUsed, setGuestUsed] = useState<boolean | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkStatus() {
      // Check auth first — if logged in, no guest restrictions apply
      const tokenRes = await fetch('/api/auth/token')
      const tokenData = await tokenRes.json()

      if (tokenData.token) {
        setIsAuthenticated(true)
        setGuestUsed(false)
        return
      }

      setIsAuthenticated(false)

      // Check if guest already used their free analysis
      const guestRes = await fetch('/api/guest')
      const guestData = await guestRes.json()
      setGuestUsed(!!guestData.token)
    }

    checkStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const tokenRes = await fetch('/api/auth/token')
      const tokenData = await tokenRes.json()

      const authToken = tokenData.token ?? null
      const data = await api.upload(file, authToken, platform, language)

      // 1. Authenticated success — analysis_id present. Page polls /status
      //    until the worker finishes (analysis may take a few minutes).
      if (data.analysis_id != null) {
        router.push(`/analysis/${data.analysis_id}`)
        return
      }

      // 2. Got a task_id (guest-style response).
      if (data.task_id) {
        // 2a. We thought we were authenticated but the backend rejected the
        //     token (expired/invalid) — clear the stale cookie and re-auth.
        if (authToken) {
          await fetch('/api/auth/logout', { method: 'POST' })
          router.push('/auth')
          return
        }
        // 2b. Real guest — track the task and go to the guest result poller.
        await fetch('/api/guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.task_id }),
        })
        router.push(`/upload/result?task=${data.task_id}`)
        return
      }

      // 3. Neither analysis_id nor task_id — genuine failure.
      setError('Upload failed. Please try again.')
      setLoading(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(t('rateLimited'))
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Connection error. Please try again.')
      }
      setLoading(false)
    }
  }

  // Still checking — don't flash the wrong screen
  if (guestUsed === null) return null

  // Guest already used their free analysis — show conversion screen
  if (guestUsed && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="px-4 md:px-8 py-6">
          <span className="text-xs font-mono text-[var(--text-muted)] tracking-widest uppercase">
            <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
              LASTSEEN
            </Link>
          </span>
        </motion.div>
        <GuestConversionScreen />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Breadcrumb */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="px-4 md:px-8 py-6"
      >
        <span className="text-xs font-mono text-[var(--text-muted)] tracking-widest uppercase">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            LASTSEEN
          </Link>
          {' / '}
          <span>{t('breadcrumb').split(' / ')[1]}</span>
        </span>
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
            <DropZone onFileSelect={setFile} selectedFile={file} error={error} />

            <PlatformSelector selected={platform} onSelect={setPlatform} />

            <LanguageSelector selected={language} onSelect={setLanguage} />

            <p className="text-xs font-mono text-[var(--text-muted)] leading-relaxed">
              {t('privacy')}
            </p>

            <Button
              type="submit"
              variant={!file || loading ? 'disabled' : 'primary'}
              disabled={!file || loading}
              loading={loading}
              className="w-full"
            >
              {loading ? t('analyzing') : t('cta')}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
