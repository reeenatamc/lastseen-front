'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface InlineConfirmProps {
  /** Text of the initial delete button */
  label: string
  /** Runs after the user confirms; throw to show the error message */
  onConfirm: () => Promise<void>
  /** Called with the outcome so the parent can announce it */
  onResult?: (ok: boolean) => void
}

const BUTTON =
  'min-h-[44px] px-3 text-xs font-mono uppercase tracking-widest transition-colors outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:opacity-60'

/** Delete button that asks for confirmation in place, without browser dialogs. */
export function InlineConfirm({ label, onConfirm, onResult }: InlineConfirmProps) {
  const t = useTranslations('reports')
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const run = async () => {
    setBusy(true)
    setFailed(false)
    try {
      await onConfirm()
      onResult?.(true)
    } catch {
      setFailed(true)
      setBusy(false)
      onResult?.(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        {confirming ? (
          <>
            <button
              type="button"
              onClick={run}
              disabled={busy}
              className={`${BUTTON} border border-[var(--destructive)] text-[var(--destructive)]`}
            >
              {t('confirm')}
            </button>
            <button
              type="button"
              onClick={() => { setConfirming(false); setFailed(false) }}
              disabled={busy}
              className={`${BUTTON} text-[var(--text-muted)] hover:text-[var(--text-primary)]`}
            >
              {t('cancel')}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className={`${BUTTON} text-[var(--text-muted)] hover:text-[var(--destructive)]`}
          >
            {label}
          </button>
        )}
      </div>
      {failed && (
        <p role="alert" className="text-xs font-mono text-[var(--destructive)]">{t('deleteError')}</p>
      )}
    </div>
  )
}
