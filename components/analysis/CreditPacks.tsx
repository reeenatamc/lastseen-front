'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { api, ApiError } from '@/lib/api/client'
import { isSafeCheckoutUrl } from '@/lib/checkout-url'
import type { CreditPack } from '@/lib/api/types'

interface CreditPacksProps {
  packs: CreditPack[]
  token: string
  /** Re-requests the balance after the user paid in the external page */
  onRefresh: () => Promise<void>
}

function formatPrice(cents: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100)
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`
  }
}

export function CreditPacks({ packs, token, onRefresh }: CreditPacksProps) {
  const t = useTranslations('paywall')
  const locale = useLocale()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<'network' | 'unavailable' | null>(null)

  const handleCheckout = async (pack: CreditPack) => {
    setBusy(pack.key)
    setError(null)
    try {
      const { url } = await api.createCheckout(pack.key, token)
      if (!isSafeCheckoutUrl(url)) {
        setError('unavailable')
        setBusy(null)
        return
      }
      window.location.assign(url)
    } catch (err) {
      setError(err instanceof ApiError && err.status === 503 ? 'unavailable' : 'network')
      setBusy(null)
    }
  }

  const handleRefresh = async () => {
    setBusy('refresh')
    setError(null)
    await onRefresh()
    setBusy(null)
  }

  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        {packs.map(pack => (
          <Button
            key={pack.key}
            type="button"
            onClick={() => handleCheckout(pack)}
            loading={busy === pack.key}
            disabled={busy !== null}
            className="w-full sm:w-auto"
          >
            {t('pack', {
              count: pack.credits,
              price: formatPrice(pack.price_cents, pack.currency, locale),
            })}
          </Button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleRefresh}
        disabled={busy !== null}
        className="self-start min-h-[44px] text-xs font-mono text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text-primary)] transition-colors outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:opacity-60"
      >
        {t('refresh')}
      </button>
      <p className="text-[11px] font-mono text-[var(--text-muted)]">{t('processor')}</p>
      {error && (
        <p role="alert" className="text-xs font-mono text-[var(--destructive)]">
          {error === 'unavailable' ? t('unavailable') : t('errors.network')}
        </p>
      )}
    </div>
  )
}
