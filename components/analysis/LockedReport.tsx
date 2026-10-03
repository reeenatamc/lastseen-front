'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/Button'
import { CreditPacks } from '@/components/analysis/CreditPacks'
import { useCredits } from '@/hooks/useCredits'
import type { AccessInfo } from '@/lib/api/types'

type PreviewAccess = Extract<AccessInfo, { level: 'preview' }>

interface LockedReportProps {
  access: PreviewAccess
  /** Auth token; null for guests */
  token: string | null
  /** Privacy line shown at the bottom */
  privacy?: string
}

export function LockedReport({ access, token, privacy }: LockedReportProps) {
  const t = useTranslations('paywall')
  const router = useRouter()
  const { teaser } = access
  const { balance, packs, failed, reload } = useCredits(token)

  const included: string[] = []
  if ((teaser.conflict_episodes ?? 0) > 0) {
    included.push(t('includes.conflict', { count: teaser.conflict_episodes ?? 0 }))
  }
  if (teaser.turning_point_detected) included.push(t('includes.turningPoint'))
  if (teaser.closing_phase_detected) included.push(t('includes.closingPhase'))
  included.push(t('includes.tone'), t('includes.initiative'), t('includes.narrative'))

  const canUpload = !!balance && (balance.is_premium || balance.credits > 0)

  return (
    <section className="flex flex-col gap-5">
      <h2
        className="story-datum-long [overflow-wrap:anywhere]"
        style={{ fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif', color: 'var(--warm)' }}
      >
        {t('title')}
      </h2>

      <ul className="flex flex-col">
        {included.map(item => (
          <li key={item} className="flex items-start gap-3 story-locked-item text-[var(--text-primary)]">
            <span aria-hidden="true" className="mt-[0.8em] w-1 h-1 shrink-0 bg-[var(--warm)]" />
            {item}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3" aria-live="polite">
        {!token && (
          <>
            <Button onClick={() => router.push('/auth')} className="w-full sm:w-auto sm:self-start">
              {t('guest.cta')}
            </Button>
            <p className="text-xs font-mono text-[var(--text-muted)]">{t('reuploadNote')}</p>
          </>
        )}

        {token && !balance && !failed && (
          <p className="text-xs font-mono text-[var(--text-muted)]">{t('loading')}</p>
        )}

        {token && failed && (
          <>
            <p role="alert" className="text-xs font-mono text-[var(--destructive)]">
              {t('errors.network')}
            </p>
            <button
              type="button"
              onClick={() => reload()}
              className="self-start min-h-[44px] text-xs font-mono text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text-primary)] transition-colors outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              {t('retry')}
            </button>
          </>
        )}

        {token && balance && canUpload && (
          <>
            <Button onClick={() => router.push('/upload')} className="w-full sm:w-auto sm:self-start">
              {t('reupload.cta')}
            </Button>
            {!balance.is_premium && (
              <p className="text-xs font-mono text-[var(--text-muted)]">
                {t('reupload.credit', { count: balance.credits })}
              </p>
            )}
          </>
        )}

        {token && balance && !canUpload && packs && packs.length > 0 && (
          <>
            <CreditPacks packs={packs} token={token} onRefresh={reload} />
            <p className="text-xs font-mono text-[var(--text-muted)]">{t('reuploadNote')}</p>
          </>
        )}

        {token && balance && !canUpload && packs && packs.length === 0 && (
          <p className="text-xs font-mono text-[var(--text-muted)]">{t('unavailable')}</p>
        )}
      </div>
      {privacy && <p className="story-detail">{privacy}</p>}
    </section>
  )
}
