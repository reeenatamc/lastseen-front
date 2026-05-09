'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { DropZone } from '@/components/upload/DropZone'
import { PlatformSelector } from '@/components/upload/PlatformSelector'
import { Button } from '@/components/ui/Button'
import { Link } from '@/i18n/navigation'
import { api, ApiError } from '@/lib/api/client'
import { fadeIn, fadeUp, EASE_OUT } from '@/lib/motion'

type Platform = 'whatsapp' | 'telegram' | 'imessage'

export default function UploadPage() {
  const router = useRouter()
  const t = useTranslations('upload')
  const [file, setFile] = useState<File | null>(null)
  const [platform, setPlatform] = useState<Platform>('whatsapp')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const tokenRes = await fetch('/api/auth/token')
      const tokenData = await tokenRes.json()

      if (!tokenRes.ok || !tokenData.token) {
        router.push('/auth')
        return
      }

      const data = await api.upload(file, tokenData.token, platform)

      if (data.analysis_id != null) {
        router.push(`/analysis/${data.analysis_id}`)
      } else {
        setError('Upload failed. Please try again.')
        setLoading(false)
      }
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
            <DropZone
              onFileSelect={setFile}
              selectedFile={file}
              error={error}
            />

            <PlatformSelector
              selected={platform}
              onSelect={setPlatform}
            />

            {/* Privacy note */}
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
