'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import {
  buildShareCardData,
  loadShareFonts,
  renderShareCard,
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
} from '@/lib/share/card'
import type { AnalysisResult } from '@/lib/api/types'

const FILE_NAME = 'lastseen.png'

export function ShareCard({ result }: { result: NonNullable<AnalysisResult['result']> }) {
  const t = useTranslations('share')
  const locale = useLocale()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canShare, setCanShare] = useState(false)
  const [error, setError] = useState(false)

  const turningLabel = t('turning')
  const data = useMemo(() => {
    const episodes = result.conflict && !('error' in result.conflict) ? result.conflict.episodes.length : 0
    return buildShareCardData(
      result,
      locale,
      {
        days: t('days'),
        messages: t('messages'),
        conflict: t('conflict', { count: episodes }),
        turning: turningLabel,
      },
      typeof window !== 'undefined' ? window.location.host : '',
    )
  }, [result, locale, t, turningLabel])

  const draw = useCallback(async () => {
    if (!canvasRef.current) return
    await loadShareFonts()
    if (canvasRef.current) renderShareCard(canvasRef.current, data)
  }, [data])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    try {
      const probe = new File([''], FILE_NAME, { type: 'image/png' })
      setCanShare(!!navigator.canShare && navigator.canShare({ files: [probe] }))
    } catch {
      setCanShare(false)
    }
  }, [])

  const toBlob = async (): Promise<Blob | null> => {
    await draw()
    const canvas = canvasRef.current
    if (!canvas) return null
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
  }

  const handleSave = async () => {
    setError(false)
    const blob = await toBlob()
    if (!blob) {
      setError(true)
      return
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = FILE_NAME
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    setError(false)
    const blob = await toBlob()
    if (!blob) {
      setError(true)
      return
    }
    try {
      await navigator.share({ files: [new File([blob], FILE_NAME, { type: 'image/png' })] })
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) setError(true)
    }
  }

  return (
    <section className="flex flex-col md:flex-row gap-5 md:items-end">
      <canvas
        ref={canvasRef}
        width={SHARE_CARD_WIDTH}
        height={SHARE_CARD_HEIGHT}
        role="img"
        aria-label={t('previewAlt')}
        className="share-card-canvas shrink-0 self-start md:self-auto border border-[var(--border)]"
        style={{ aspectRatio: '9 / 16' }}
      />
      <div className="flex flex-col gap-3 w-full md:w-56">
        <h2 className="sr-only">{t('title')}</h2>
        <Button type="button" onClick={handleSave} className="w-full">{t('save')}</Button>
        {canShare && (
          <Button type="button" variant="ghost" onClick={handleShare} className="w-full">{t('share')}</Button>
        )}
        <div aria-live="polite">
          {error && (
            <p role="alert" className="text-xs font-mono text-[var(--destructive)]">{t('error')}</p>
          )}
        </div>
      </div>
    </section>
  )
}
